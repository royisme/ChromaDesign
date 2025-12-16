/**
 * Usage Tracking Service
 *
 * Server functions for tracking user usage limits via Cloudflare KV
 */

import { createServerFn } from "@tanstack/react-start";
import { env } from "cloudflare:workers";
import type { UsageRecord, UsageStatus } from "@/types/usage";
import { USAGE_LIMITS } from "@/types/usage";

// Get today's date (UTC)
export function getTodayUTC(date: Date = new Date()): string {
  return date.toISOString().split("T")[0];
}

// Get next reset time
export function getNextResetTime(date: Date = new Date()): string {
  const tomorrow = new Date(date);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);
  return tomorrow.toISOString();
}

// --- Core Business Logic (Pure Functions) ---

export async function checkUsageLogic(
  kv: KVNamespace | undefined,
  visitorId: string,
  now: Date = new Date()
): Promise<UsageStatus> {
  const today = getTodayUTC(now);

  // Fallback if KV is missing
  if (!kv) {
    console.warn('KV Binding "USAGE_KV" not found. Using fallback.');
    return {
      remaining: USAGE_LIMITS.DAILY_FREE,
      total: USAGE_LIMITS.DAILY_FREE,
      canUseBonus: true,
      resetAt: getNextResetTime(now),
    };
  }

  const key = `visitor:${visitorId}`;
  const record = await kv.get<UsageRecord>(key, "json");

  // Return full quota if no record or date is not today
  if (!record || record.date !== today) {
    return {
      remaining: USAGE_LIMITS.DAILY_FREE,
      total: USAGE_LIMITS.DAILY_FREE,
      canUseBonus: true,
      resetAt: getNextResetTime(now),
    };
  }

  const actualTotal =
    USAGE_LIMITS.DAILY_FREE + (record.bonusUsed ? USAGE_LIMITS.SHARE_BONUS : 0);
  const actualRemaining = Math.max(0, actualTotal - record.used);

  return {
    remaining: actualRemaining,
    total: actualTotal,
    canUseBonus: !record.bonusUsed,
    resetAt: getNextResetTime(now),
  };
}

export async function consumeUsageLogic(
  kv: KVNamespace | undefined,
  visitorId: string,
  now: Date = new Date()
): Promise<{ success: boolean; remaining: number }> {
  const today = getTodayUTC(now);

  if (!kv) {
    console.warn(
      'KV Binding "USAGE_KV" not found. Allowing action (fallback).'
    );
    return {
      success: true,
      remaining: USAGE_LIMITS.DAILY_FREE - 1,
    };
  }

  const key = `visitor:${visitorId}`;
  let record = await kv.get<UsageRecord>(key, "json");

  // New user or new day
  if (!record || record.date !== today) {
    record = { date: today, used: 0, bonusUsed: false };
  }

  // Calculate available quota
  const totalAvailable =
    USAGE_LIMITS.DAILY_FREE + (record.bonusUsed ? USAGE_LIMITS.SHARE_BONUS : 0);

  if (record.used >= totalAvailable) {
    return { success: false, remaining: 0 };
  }

  // Consume quota
  record.used += 1;
  await kv.put(key, JSON.stringify(record), {
    expirationTtl: USAGE_LIMITS.KV_TTL,
  });

  const remaining = totalAvailable - record.used;
  return {
    success: true,
    remaining: Math.max(0, remaining),
  };
}

export async function claimShareBonusLogic(
  kv: KVNamespace | undefined,
  visitorId: string,
  now: Date = new Date()
): Promise<{ success: boolean; message: string }> {
  const today = getTodayUTC(now);

  if (!kv) {
    console.warn(
      'KV Binding "USAGE_KV" not found. Allowing action (fallback).'
    );
    return {
      success: true,
      message: "Successfully claimed +1 quota! (Fallback)",
    };
  }

  const key = `visitor:${visitorId}`;
  let record = await kv.get<UsageRecord>(key, "json");

  if (!record || record.date !== today) {
    record = { date: today, used: 0, bonusUsed: false };
  }

  if (record.bonusUsed) {
    return { success: false, message: "Share bonus already claimed today" };
  }

  record.bonusUsed = true;
  await kv.put(key, JSON.stringify(record), {
    expirationTtl: USAGE_LIMITS.KV_TTL,
  });

  return { success: true, message: "Successfully claimed +1 quota!" };
}

// --- Server Functions (Wrappers) ---

// Validator for check usage
const checkUsageValidator = (input: unknown) => {
  const data = input as { visitorId: string };
  if (!data.visitorId) throw new Error("visitorId is required");
  return data;
};

// Validator for consume usage
const consumeUsageValidator = (input: unknown) => {
  const data = input as { visitorId: string };
  if (!data.visitorId) throw new Error("visitorId is required");
  return data;
};

// Validator for claim bonus
const claimBonusValidator = (input: unknown) => {
  const data = input as { visitorId: string };
  if (!data.visitorId) throw new Error("visitorId is required");
  return data;
};

/**
 * Check user usage status
 */
export const checkUsage = createServerFn({ method: "POST" })
  .inputValidator(checkUsageValidator)
  .handler(async ({ data }): Promise<UsageStatus> => {
    return checkUsageLogic(env.USAGE_KV, data.visitorId);
  });

/**
 * Consume one usage quota
 */
export const consumeUsage = createServerFn({ method: "POST" })
  .inputValidator(consumeUsageValidator)
  .handler(
    async ({ data }): Promise<{ success: boolean; remaining: number }> => {
      return consumeUsageLogic(env.USAGE_KV, data.visitorId);
    }
  );

/**
 * Claim share bonus
 */
export const claimShareBonus = createServerFn({ method: "POST" })
  .inputValidator(claimBonusValidator)
  .handler(async ({ data }): Promise<{ success: boolean; message: string }> => {
    return claimShareBonusLogic(env.USAGE_KV, data.visitorId);
  });
