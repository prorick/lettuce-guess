import { describe, expect, it } from 'vitest'
import { loadDaily, loadStats, saveDaily, saveStats, type KeyValueStore } from '../storage'
import { emptyStats, recordDailyResult } from '../stats'

function memoryStore(initial: Record<string, string> = {}): KeyValueStore & { data: Record<string, string> } {
  const data = { ...initial }
  return {
    data,
    getItem: (k) => (k in data ? data[k]! : null),
    setItem: (k, v) => {
      data[k] = v
    },
  }
}

describe('daily progress', () => {
  it("restores today's guesses after a refresh", () => {
    const store = memoryStore()
    saveDaily(42, ['crane', 'stoic'], store)
    expect(loadDaily(42, store)).toEqual(['crane', 'stoic'])
  })

  it("starts fresh when the saved board is yesterday's", () => {
    const store = memoryStore()
    saveDaily(41, ['crane'], store)
    expect(loadDaily(42, store)).toBeNull()
  })

  it('ignores a corrupted or hand-edited save instead of crashing', () => {
    expect(loadDaily(42, memoryStore({ 'lettuce-guess:daily:v1': '{not json' }))).toBeNull()
    expect(loadDaily(42, memoryStore({ 'lettuce-guess:daily:v1': '{"puzzle":42,"guesses":["<script>"]}' }))).toBeNull()
  })

  it('keeps working when storage is unavailable (private window, blocked site data)', () => {
    const throwing: KeyValueStore = {
      getItem: () => {
        throw new Error('SecurityError')
      },
      setItem: () => {
        throw new Error('QuotaExceededError')
      },
    }
    expect(() => saveDaily(1, ['crane'], throwing)).not.toThrow()
    expect(loadDaily(1, throwing)).toBeNull()
    expect(loadStats(throwing)).toEqual(emptyStats())
  })
})

describe('stats persistence', () => {
  it('round-trips stats', () => {
    const store = memoryStore()
    const stats = recordDailyResult(emptyStats(), 5, true, 4)
    saveStats(stats, store)
    expect(loadStats(store)).toEqual(stats)
  })
})
