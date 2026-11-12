import { ANSWERS } from './words'

/**
 * Puzzle #1 is this calendar day, in each player's LOCAL time zone
 * (ADR-0002: day boundary = local midnight).
 */
export const LAUNCH = { year: 2026, month: 11, day: 11 } as const

const DAY_MS = 86_400_000

/**
 * A day counter that ignores the clock time and DST: the local calendar date
 * (y/m/d) re-read as if it were UTC midnight. Subtracting raw timestamps
 * instead would make a 23-hour DST day round to the wrong puzzle.
 */
function calendarDay(date: Date): number {
  return Math.round(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY_MS)
}

const LAUNCH_DAY = calendarDay(new Date(LAUNCH.year, LAUNCH.month - 1, LAUNCH.day))

/** 1-based puzzle number for a moment in time; clamps to 1 for clocks set before launch. */
export function puzzleNumber(now: Date = new Date()): number {
  return Math.max(1, calendarDay(now) - LAUNCH_DAY + 1)
}

/** The shared answer for a puzzle number. Wraps around after ~5½ years. */
export function answerForPuzzle(n: number, answers: readonly string[] = ANSWERS): string {
  const idx = (((n - 1) % answers.length) + answers.length) % answers.length
  return answers[idx]!
}

/** Today's shared answer — the daily mode's only answer source. */
export function answerFor(now: Date = new Date()): string {
  return answerForPuzzle(puzzleNumber(now))
}

/**
 * An answer for a "just for fun" round (ADR-0002, QST-RANDOM-UNLOCK).
 * `exclude` keeps it from handing back today's daily word or the round just played.
 */
export function randomAnswer(
  exclude: readonly string[] = [],
  rand: () => number = Math.random,
  answers: readonly string[] = ANSWERS,
): string {
  const skip = new Set(exclude.map((w) => w.toLowerCase()))
  const pool = answers.filter((w) => !skip.has(w))
  const from = pool.length > 0 ? pool : answers
  return from[Math.floor(rand() * from.length)]!
}

/** Milliseconds until the next local midnight, when the next puzzle unlocks. */
export function msUntilNextPuzzle(now: Date = new Date()): number {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  return next.getTime() - now.getTime()
}
