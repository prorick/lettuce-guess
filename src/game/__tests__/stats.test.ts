import { describe, expect, it } from 'vitest'
import { displayedStreak, emptyStats, recordDailyResult, winPercent } from '../stats'

describe('daily stats', () => {
  it('grows the streak across consecutive daily wins', () => {
    let s = emptyStats()
    s = recordDailyResult(s, 10, true, 3)
    s = recordDailyResult(s, 11, true, 4)
    s = recordDailyResult(s, 12, true, 2)
    expect(s.currentStreak).toBe(3)
    expect(s.maxStreak).toBe(3)
    expect(s.distribution).toEqual([0, 1, 1, 1, 0, 0])
  })

  it('restarts the streak at 1 after a skipped day', () => {
    let s = recordDailyResult(emptyStats(), 10, true, 3)
    s = recordDailyResult(s, 12, true, 3) // skipped puzzle 11
    expect(s.currentStreak).toBe(1)
    expect(s.maxStreak).toBe(1)
  })

  it('shows a lapsed streak as 0 even before the next game is played', () => {
    const s = recordDailyResult(emptyStats(), 10, true, 3)
    expect(displayedStreak(s, 11)).toBe(1) // won yesterday: still alive today
    expect(displayedStreak(s, 12)).toBe(0) // missed a day
  })

  it('breaks the streak on a loss but keeps the best streak', () => {
    let s = recordDailyResult(emptyStats(), 10, true, 3)
    s = recordDailyResult(s, 11, true, 3)
    s = recordDailyResult(s, 12, false, 6)
    expect(s.currentStreak).toBe(0)
    expect(s.maxStreak).toBe(2)
    expect(winPercent(s)).toBe(67)
  })

  it('does not count the same daily twice when the finished page is reloaded', () => {
    const once = recordDailyResult(emptyStats(), 10, true, 3)
    const twice = recordDailyResult(once, 10, true, 3)
    expect(twice).toEqual(once)
  })
})
