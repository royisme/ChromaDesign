/**
 * User Usage Record
 */
export interface UsageRecord {
  date: string; // ISO Date "YYYY-MM-DD"
  used: number; // Used count today
  bonusUsed: boolean; // Whether share bonus is used today
}

/**
 * Usage Status Response
 */
export interface UsageStatus {
  remaining: number; // Remaining quota
  total: number; // Total quota for today
  canUseBonus: boolean; // Whether share bonus can be used
  resetAt: string; // Next reset time (ISO)
}

/**
 * Quota Limits
 */
export const USAGE_LIMITS = {
  DAILY_FREE: 3, // Daily free limit
  SHARE_BONUS: 1, // Share bonus limit
  KV_TTL: 60 * 60 * 24 * 7, // 7 days TTL (seconds)
} as const;
