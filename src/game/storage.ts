import { emptyStats, type Stats } from './stats'
import { MAX_GUESSES, WORD_LENGTH } from './types'

/**
 * Browser persistence (ADR-0002: no accounts, no backend — localStorage only).
 * Every access is wrapped: private windows, blocked site data, or a quota error
 * must never break the game — it just forgets.
 */
export type KeyValueStore = Pick<Storage, 'getItem' | 'setItem'>

const KEY_DAILY = 'lettuce-guess:daily:v1'
const KEY_STATS = 'lettuce-guess:stats:v1'
const KEY_HELP = 'lettuce-guess:seen-help:v1'

export function browserStore(): KeyValueStore | undefined {
  try {
    return globalThis.localStorage ?? undefined
  } catch {
    return undefined
  }
}

function readJson(store: KeyValueStore | undefined, key: string): unknown {
  if (!store) return undefined
  try {
    const raw = store.getItem(key)
    return raw === null ? undefined : JSON.parse(raw)
  } catch {
    return undefined
  }
}

function writeJson(store: KeyValueStore | undefined, key: string, value: unknown): void {
  if (!store) return
  try {
    store.setItem(key, JSON.stringify(value))
  } catch {
    /* storage full or blocked — the game still works, it just won't remember */
  }
}

const isWord = (w: unknown): w is string => typeof w === 'string' && new RegExp(`^[a-z]{${WORD_LENGTH}}$`).test(w)

/** Today's saved guesses, or null if the save is for another day or unreadable. */
export function loadDaily(puzzle: number, store = browserStore()): string[] | null {
  const saved = readJson(store, KEY_DAILY) as { puzzle?: unknown; guesses?: unknown } | undefined
  if (!saved || saved.puzzle !== puzzle || !Array.isArray(saved.guesses)) return null
  if (saved.guesses.length > MAX_GUESSES || !saved.guesses.every(isWord)) return null
  return saved.guesses
}

export function saveDaily(puzzle: number, guesses: readonly string[], store = browserStore()): void {
  writeJson(store, KEY_DAILY, { puzzle, guesses })
}

export function loadStats(store = browserStore()): Stats {
  const saved = readJson(store, KEY_STATS)
  const base = emptyStats()
  if (!saved || typeof saved !== 'object') return base
  const s = saved as Partial<Record<keyof Stats, unknown>>
  const num = (v: unknown, d: number) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : d)
  const numOrNull = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : null)
  const dist =
    Array.isArray(s.distribution) && s.distribution.length === MAX_GUESSES
      ? s.distribution.map((v) => num(v, 0))
      : base.distribution
  return {
    played: num(s.played, 0),
    won: num(s.won, 0),
    currentStreak: num(s.currentStreak, 0),
    maxStreak: num(s.maxStreak, 0),
    lastPlayed: numOrNull(s.lastPlayed),
    lastWon: numOrNull(s.lastWon),
    distribution: dist,
  }
}

export function saveStats(stats: Stats, store = browserStore()): void {
  writeJson(store, KEY_STATS, stats)
}

export function hasSeenHelp(store = browserStore()): boolean {
  return readJson(store, KEY_HELP) === true
}

export function markHelpSeen(store = browserStore()): void {
  writeJson(store, KEY_HELP, true)
}
