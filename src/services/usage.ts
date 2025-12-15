import { createServerFn } from '@tanstack/react-start'
// import { getWebRequest } from '@tanstack/react-start/server'
// It seems getWebRequest is not available, try getRequest
import { getRequest } from '@tanstack/react-start/server'
import type { UsageRecord, UsageStatus } from '~/types/usage'
import { USAGE_LIMITS } from '~/types/usage'

// 类型定义：Cloudflare 平台上下文
interface CloudflareContext {
  cloudflare?: {
    env?: {
      USAGE_KV?: KVNamespace
    }
  }
}

// 获取今日日期 (UTC)
// 导出以便测试
export function getTodayUTC(date: Date = new Date()): string {
  return date.toISOString().split('T')[0]
}

// 获取下次重置时间
// 导出以便测试
export function getNextResetTime(date: Date = new Date()): string {
  const tomorrow = new Date(date)
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
  tomorrow.setUTCHours(0, 0, 0, 0)
  return tomorrow.toISOString()
}

// Helper to get IP from request
function getIpFromRequest(request: Request): string {
  const cfIp = request.headers.get('cf-connecting-ip')
  if (cfIp) return cfIp

  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()

  return '127.0.0.1' // Fallback for local dev
}

// --- 核心业务逻辑 (Pure Functions) ---

export async function checkUsageLogic(
  kv: KVNamespace | undefined, 
  identifier: string, // Changed from visitorId to generic identifier (IP)
  now: Date = new Date()
): Promise<UsageStatus> {
  const today = getTodayUTC(now)
  
  // Fallback if KV is missing
  if (!kv) {
    console.warn('KV Binding "USAGE_KV" not found in context. Using fallback.')
    return {
      remaining: USAGE_LIMITS.DAILY_FREE,
      total: USAGE_LIMITS.DAILY_FREE,
      canUseBonus: true,
      resetAt: getNextResetTime(now),
    }
  }
  
  // Use "ip:" prefix for IP-based tracking
  const key = `ip:${identifier}`
  const record = await kv.get<UsageRecord>(key, 'json')
  
  // 如果没有记录或日期不是今天，返回满额度
  if (!record || record.date !== today) {
    return {
      remaining: USAGE_LIMITS.DAILY_FREE,
      total: USAGE_LIMITS.DAILY_FREE,
      canUseBonus: true,
      resetAt: getNextResetTime(now),
    }
  }
  
  const remaining = Math.max(0, USAGE_LIMITS.DAILY_FREE - record.used)
  
  const actualTotal = USAGE_LIMITS.DAILY_FREE + (record.bonusUsed ? USAGE_LIMITS.SHARE_BONUS : 0)
  const actualRemaining = Math.max(0, actualTotal - record.used)
  
  return {
    remaining: actualRemaining,
    total: actualTotal,
    canUseBonus: !record.bonusUsed,
    resetAt: getNextResetTime(now),
  }
}

export async function consumeUsageLogic(
  kv: KVNamespace | undefined,
  identifier: string,
  now: Date = new Date()
): Promise<{ success: boolean; remaining: number }> {
  const today = getTodayUTC(now)
  
  if (!kv) {
    console.warn('KV Binding "USAGE_KV" not found. Allowing action (fallback).')
    return { 
      success: true, 
      remaining: USAGE_LIMITS.DAILY_FREE - 1 
    }
  }
  
  const key = `ip:${identifier}`
  let record = await kv.get<UsageRecord>(key, 'json')
  
  // 新用户或新的一天
  if (!record || record.date !== today) {
    record = { date: today, used: 0, bonusUsed: false }
  }
  
  // 计算可用额度
  const totalAvailable = USAGE_LIMITS.DAILY_FREE + (record.bonusUsed ? USAGE_LIMITS.SHARE_BONUS : 0)
  
  if (record.used >= totalAvailable) {
    return { success: false, remaining: 0 }
  }
  
  // 消耗额度
  record.used += 1
  await kv.put(key, JSON.stringify(record), { expirationTtl: USAGE_LIMITS.KV_TTL })
  
  const remaining = totalAvailable - record.used
  return { 
    success: true, 
    remaining: Math.max(0, remaining)
  }
}

export async function claimShareBonusLogic(
  kv: KVNamespace | undefined,
  identifier: string,
  now: Date = new Date()
): Promise<{ success: boolean; message: string }> {
  const today = getTodayUTC(now)
  
  if (!kv) {
    console.warn('KV Binding "USAGE_KV" not found. Allowing action (fallback).')
    return { 
      success: true, 
      message: '成功获得 +1 次额度！(Fallback)' 
    }
  }
  
  const key = `ip:${identifier}`
  let record = await kv.get<UsageRecord>(key, 'json')
  
  if (!record || record.date !== today) {
    record = { date: today, used: 0, bonusUsed: false }
  }
  
  if (record.bonusUsed) {
    return { success: false, message: '今日已领取过分享奖励' }
  }
  
  record.bonusUsed = true
  await kv.put(key, JSON.stringify(record), { expirationTtl: USAGE_LIMITS.KV_TTL })
  
  return { success: true, message: '成功获得 +1 次额度！' }
}

// --- Server Functions (Wrappers) ---

// Validator for check usage
const checkUsageValidator = (input: unknown) => {
  const data = input as { visitorId?: string }
  // We don't strictly require visitorId anymore since we use IP,
  // but we keep it optional in case we want to use it later or for client compatibility.
  return data
}

/**
 * 检查用户使用状态
 */
export const checkUsage = createServerFn({ method: 'POST' })
  .inputValidator(checkUsageValidator)
  .handler(async ({ data, context }): Promise<UsageStatus> => {
    const ctx = context as unknown as CloudflareContext
    const request = getRequest()
    const ip = request ? getIpFromRequest(request) : '127.0.0.1'

    // Log for debugging (remove in production if needed)
    console.log(`Checking usage for IP: ${ip}`)

    return checkUsageLogic(ctx.cloudflare?.env?.USAGE_KV, ip)
  })

/**
 * 消耗一次使用额度
 */
export const consumeUsage = createServerFn({ method: 'POST' })
  .inputValidator(checkUsageValidator)
  .handler(async ({ data, context }): Promise<{ success: boolean; remaining: number }> => {
    const ctx = context as unknown as CloudflareContext
    const request = getRequest()
    const ip = request ? getIpFromRequest(request) : '127.0.0.1'

    console.log(`Consuming usage for IP: ${ip}`)

    return consumeUsageLogic(ctx.cloudflare?.env?.USAGE_KV, ip)
  })

/**
 * 领取分享奖励
 */
export const claimShareBonus = createServerFn({ method: 'POST' })
  .inputValidator(checkUsageValidator)
  .handler(async ({ data, context }): Promise<{ success: boolean; message: string }> => {
    const ctx = context as unknown as CloudflareContext
    const request = getRequest()
    const ip = request ? getIpFromRequest(request) : '127.0.0.1'

    return claimShareBonusLogic(ctx.cloudflare?.env?.USAGE_KV, ip)
  })
