import { createServerFn } from '@tanstack/react-start'
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

// --- 核心业务逻辑 (Pure Functions) ---

export async function checkUsageLogic(
  kv: KVNamespace | undefined, 
  visitorId: string,
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
  
  const key = `visitor:${visitorId}`
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
  
  // 只有当 bonus 已经被领取（使用）后，才将其计入额度
  // 或者，如果我们要显示"总共可能获得的额度"，那就是另一回事
  // 这里我们遵循：显示当前实际拥有的额度
  
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
  visitorId: string,
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
  
  const key = `visitor:${visitorId}`
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
  visitorId: string,
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
  
  const key = `visitor:${visitorId}`
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
  const data = input as { visitorId: string }
  if (!data.visitorId) throw new Error('visitorId is required')
  return data
}

// Validator for consume usage
const consumeUsageValidator = (input: unknown) => {
  const data = input as { visitorId: string }
  if (!data.visitorId) throw new Error('visitorId is required')
  return data
}

// Validator for claim bonus
const claimBonusValidator = (input: unknown) => {
  const data = input as { visitorId: string }
  if (!data.visitorId) throw new Error('visitorId is required')
  return data
}

/**
 * 检查用户使用状态
 */
export const checkUsage = createServerFn({ method: 'POST' })
  .inputValidator(checkUsageValidator)
  .handler(async ({ data, context }): Promise<UsageStatus> => {
    const ctx = context as unknown as CloudflareContext
    return checkUsageLogic(ctx.cloudflare?.env?.USAGE_KV, data.visitorId)
  })

/**
 * 消耗一次使用额度
 */
export const consumeUsage = createServerFn({ method: 'POST' })
  .inputValidator(consumeUsageValidator)
  .handler(async ({ data, context }): Promise<{ success: boolean; remaining: number }> => {
    const ctx = context as unknown as CloudflareContext
    return consumeUsageLogic(ctx.cloudflare?.env?.USAGE_KV, data.visitorId)
  })

/**
 * 领取分享奖励
 */
export const claimShareBonus = createServerFn({ method: 'POST' })
  .inputValidator(claimBonusValidator)
  .handler(async ({ data, context }): Promise<{ success: boolean; message: string }> => {
    const ctx = context as unknown as CloudflareContext
    return claimShareBonusLogic(ctx.cloudflare?.env?.USAGE_KV, data.visitorId)
  })