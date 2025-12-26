
import { describe, it, expect, vi } from 'vitest'
import { USAGE_LIMITS } from '@/types/usage'

// Mock cloudflare:workers
vi.mock('cloudflare:workers', () => ({
  env: {
    USAGE_KV: {}
  }
}))

// Mock @tanstack/react-start/server
vi.mock('@tanstack/react-start/server', () => ({
  getRequestHeader: () => '127.0.0.1',
  createServerFn: () => ({
    inputValidator: () => ({
      handler: () => {}
    })
  })
}))

// Import after mocks
import { checkUsageLogic, consumeUsageLogic, claimShareBonusLogic } from '@/server/services/usage'

// Mock KVNamespace
const createMockKV = () => {
  const store = new Map<string, string>()
  return {
    get: async (key: string) => {
      const val = store.get(key)
      return val ? JSON.parse(val) : null
    },
    put: async (key: string, val: string) => {
      store.set(key, val)
    },
    delete: async (key: string) => {
      store.delete(key)
    },
    list: async () => ({ keys: [] }),
    getWithMetadata: async () => ({ value: null, metadata: null }),
  } as unknown as KVNamespace
}

describe('Usage Logic', () => {
  const ip = '127.0.0.1'
  const otherIp = '10.0.0.1'

  it('should allow usage for new user', async () => {
    const kv = createMockKV()
    const status = await checkUsageLogic(kv, ip)

    expect(status.remaining).toBe(USAGE_LIMITS.DAILY_FREE)
    expect(status.total).toBe(USAGE_LIMITS.DAILY_FREE)
    expect(status.canUseBonus).toBe(true)
  })

  it('should consume usage correctly', async () => {
    const kv = createMockKV()

    // First use
    const res1 = await consumeUsageLogic(kv, ip)
    expect(res1.success).toBe(true)
    expect(res1.remaining).toBe(USAGE_LIMITS.DAILY_FREE - 1)

    // Check status
    const status = await checkUsageLogic(kv, ip)
    expect(status.remaining).toBe(USAGE_LIMITS.DAILY_FREE - 1)
  })

  it('should block after limit reached', async () => {
    const kv = createMockKV()

    // Consume all free quota
    for (let i = 0; i < USAGE_LIMITS.DAILY_FREE; i++) {
      await consumeUsageLogic(kv, ip)
    }

    const status = await checkUsageLogic(kv, ip)
    expect(status.remaining).toBe(0)

    // Try one more
    const res = await consumeUsageLogic(kv, ip)
    expect(res.success).toBe(false)
  })

  it('should reset quota next day', async () => {
    const kv = createMockKV()
    const today = new Date()

    // Consume today
    await consumeUsageLogic(kv, ip, today)

    // Check tomorrow
    const tomorrow = new Date(today)
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)

    const status = await checkUsageLogic(kv, ip, tomorrow)
    expect(status.remaining).toBe(USAGE_LIMITS.DAILY_FREE)
  })

  it('should allow claiming bonus', async () => {
    const kv = createMockKV()

    const res = await claimShareBonusLogic(kv, ip)
    expect(res.success).toBe(true)

    const status = await checkUsageLogic(kv, ip)
    expect(status.total).toBe(USAGE_LIMITS.DAILY_FREE + USAGE_LIMITS.SHARE_BONUS)
    expect(status.canUseBonus).toBe(false)
  })

  it('should not allow claiming bonus twice', async () => {
    const kv = createMockKV()

    await claimShareBonusLogic(kv, ip)
    const res = await claimShareBonusLogic(kv, ip)

    expect(res.success).toBe(false)
  })

  it('should track different IPs separately', async () => {
    const kv = createMockKV()

    // Consume IP 1
    await consumeUsageLogic(kv, ip)

    // Check IP 2
    const status2 = await checkUsageLogic(kv, otherIp)
    expect(status2.remaining).toBe(USAGE_LIMITS.DAILY_FREE)
  })
})
