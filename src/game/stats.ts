import { MAX_GUESSES } from './types'

/** Daily-mode stats only — random rounds never touch these (ADR-0002, QST-RANDOM-UNLOCK). */
export interface Stats {
  played: number
  won: number
  currentStreak: number
  maxStreak: number
  /** Puzzle number of the last finished daily, so a reload can't count it twice. */
  lastPlayed: number | null
  lastWon: number | null
  /** distribution[i] = wins in i + 1 guesses */
  distribution: number[]
}

export function emptyStats(): Stats {
  return {
    played: 0,
    won: 0,
    currentStreak: 0,
    maxStreak: 0,
    lastPlayed: null,
    lastWon: null,
    distribution: new Array<number>(MAX_GUESSES).fill(0),
  }
}

/** Fold one finished daily into the stats. Idempotent per puzzle number. */
export function recordDailyResult(stats: Stats, puzzle: number, won: boolean, guessCount: number): Stats {
  if (stats.lastPlayed !== null && puzzle <= stats.lastPlayed) return stats

  const next: Stats = { ...stats, distribution: [...stats.distribution], played: stats.played + 1, lastPlayed: puzzle }
  if (won) {
    next.won += 1
    const slot = Math.min(Math.max(guessCount, 1), MAX_GUESSES) - 1
    next.distribution[slot] = (next.distribution[slot] ?? 0) + 1
    next.currentStreak = stats.lastWon === puzzle - 1 ? stats.currentStreak + 1 : 1
    next.maxStreak = Math.max(stats.maxStreak, next.currentStreak)
    next.lastWon = puzzle
  } else {
    next.currentStreak = 0
  }
  return next
}

/** The streak to SHOW today: a streak whose last win is older than yesterday has already lapsed. */
export function displayedStreak(stats: Stats, today: number): number {
  if (stats.lastWon === null || stats.lastWon < today - 1) return 0
  return stats.currentStreak
}

export function winPercent(stats: Stats): number {
  return stats.played === 0 ? 0 : Math.round((stats.won / stats.played) * 100)
}
