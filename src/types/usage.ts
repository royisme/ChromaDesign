/**
 * 用户使用记录
 */
export interface UsageRecord {
  date: string      // ISO 日期格式 "YYYY-MM-DD"
  used: number      // 今日已使用次数
  bonusUsed: boolean // 今日是否已使用分享奖励
}

/**
 * 使用状态响应
 */
export interface UsageStatus {
  remaining: number     // 剩余可用次数
  total: number         // 今日总额度
  canUseBonus: boolean  // 是否可以使用分享奖励
  resetAt: string       // 下次重置时间 (ISO)
}

/**
 * 配额常量
 */
export const USAGE_LIMITS = {
  DAILY_FREE: 3,        // 每日免费次数
  SHARE_BONUS: 1,       // 分享奖励次数
  KV_TTL: 60 * 60 * 24 * 7, // 7天 TTL（秒）
} as const