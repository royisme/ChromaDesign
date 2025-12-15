import { describe, it, expect, beforeEach } from 'vitest'
import { checkUsageLogic, consumeUsageLogic, claimShareBonusLogic } from './usage'
import { USAGE_LIMITS } from '~/types/usage'

// Mock KVNamespace
class MockKV {
  store = new Map<string, string>()

  async get<T>(key: string, type?: string): Promise<T | null> {
    const val = this.store.get(key)
    return val ? JSON.parse(val) : null
  }

  async put(key: string, value: string): Promise<void> {
    this.store.set(key, value)
  }
}

describe('Usage Limits Logic', () => {
  let mockKV: any
  const visitorId = 'test-visitor-123'
  const fixedDate = new Date('2024-01-15T12:00:00Z') // 固定时间

  beforeEach(() => {
    mockKV = new MockKV()
  })

  describe('checkUsageLogic', () => {
    it('should return full limit for new user', async () => {
      const status = await checkUsageLogic(mockKV, visitorId, fixedDate)
      
      expect(status.remaining).toBe(USAGE_LIMITS.DAILY_FREE)
      expect(status.total).toBe(USAGE_LIMITS.DAILY_FREE)
      expect(status.canUseBonus).toBe(true)
    })

    it('should fallback gracefully if KV is undefined', async () => {
      const status = await checkUsageLogic(undefined, visitorId, fixedDate)
      expect(status.remaining).toBe(USAGE_LIMITS.DAILY_FREE)
    })

    it('should reflect usage from KV', async () => {
      // Setup: user used 1 time
      await mockKV.put(`ip:${visitorId}`, JSON.stringify({
        date: '2024-01-15',
        used: 1,
        bonusUsed: false
      }))

      const status = await checkUsageLogic(mockKV, visitorId, fixedDate)
      expect(status.remaining).toBe(USAGE_LIMITS.DAILY_FREE - 1)
    })

    it('should reset quota on next day', async () => {
      // Setup: user used all quota yesterday
      await mockKV.put(`ip:${visitorId}`, JSON.stringify({
        date: '2024-01-14',
        used: 3,
        bonusUsed: false
      }))

      // Check on 2024-01-15
      const status = await checkUsageLogic(mockKV, visitorId, fixedDate)
      expect(status.remaining).toBe(USAGE_LIMITS.DAILY_FREE)
    })
  })

  describe('consumeUsageLogic', () => {
    it('should consume quota successfully', async () => {
      const result = await consumeUsageLogic(mockKV, visitorId, fixedDate)
      
      expect(result.success).toBe(true)
      expect(result.remaining).toBe(USAGE_LIMITS.DAILY_FREE - 1)

      // Verify KV update
      const record = await mockKV.get(`ip:${visitorId}`, 'json')
      expect(record).toEqual({
        date: '2024-01-15',
        used: 1,
        bonusUsed: false
      })
    })

    it('should fail when quota exceeded', async () => {
      // Setup: use all quota
      await mockKV.put(`ip:${visitorId}`, JSON.stringify({
        date: '2024-01-15',
        used: 3,
        bonusUsed: false
      }))

      const result = await consumeUsageLogic(mockKV, visitorId, fixedDate)
      
      expect(result.success).toBe(false)
      expect(result.remaining).toBe(0)
    })

    it('should allow usage with bonus quota', async () => {
      // Setup: used 3 times but has bonus
      await mockKV.put(`ip:${visitorId}`, JSON.stringify({
        date: '2024-01-15',
        used: 3,
        bonusUsed: true // Has bonus (+1)
      }))

      const result = await consumeUsageLogic(mockKV, visitorId, fixedDate)
      
      expect(result.success).toBe(true)
      expect(result.remaining).toBe(0) // Total 4, Used 4 (3+1) -> Remaining 0

      // Verify KV: used should be 4
      const record = await mockKV.get(`ip:${visitorId}`, 'json')
      expect(record?.used).toBe(4)
    })
  })

  describe('claimShareBonusLogic', () => {
    it('should grant bonus successfully', async () => {
      const result = await claimShareBonusLogic(mockKV, visitorId, fixedDate)
      
      expect(result.success).toBe(true)
      expect(result.message).toContain('成功')

      // Verify KV
      const record = await mockKV.get(`ip:${visitorId}`, 'json')
      expect(record?.bonusUsed).toBe(true)
    })

    it('should prevent double claiming', async () => {
      // First claim
      await claimShareBonusLogic(mockKV, visitorId, fixedDate)
      
      // Second claim
      const result = await claimShareBonusLogic(mockKV, visitorId, fixedDate)
      
      expect(result.success).toBe(false)
      expect(result.message).toContain('已领取')
    })

    it('should allow claiming again next day', async () => {
      // Claimed yesterday
      await mockKV.put(`ip:${visitorId}`, JSON.stringify({
        date: '2024-01-14',
        used: 1,
        bonusUsed: true
      }))

      // Claim today
      const result = await claimShareBonusLogic(mockKV, visitorId, fixedDate)
      
      expect(result.success).toBe(true)
    })
  })
})