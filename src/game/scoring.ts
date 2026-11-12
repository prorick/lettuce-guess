import type { TileState } from './types'

/**
 * Score a guess against the answer, one TileState per letter.
 *
 * Two passes, because duplicate letters are where naive scoring goes wrong
 * (ADR-0001, Explicitation item 3):
 *   1. exact-position matches are `correct`, and each one CONSUMES that letter
 *      from the answer;
 *   2. remaining letters are `present` only while unconsumed copies of that
 *      letter are left in the answer — otherwise `absent`.
 * So guessing EERIE against THEME marks the last E green, the first E yellow
 * (one spare E left), and the second E gray (none left).
 */
export function scoreGuess(guess: string, answer: string): TileState[] {
  const g = guess.toLowerCase()
  const a = answer.toLowerCase()
  if (g.length !== a.length) {
    throw new Error(`guess "${guess}" and answer "${answer}" differ in length`)
  }

  const result: TileState[] = new Array<TileState>(g.length).fill('absent')
  const unconsumed = new Map<string, number>()

  for (let i = 0; i < a.length; i++) {
    const ch = a[i]!
    if (g[i] === ch) result[i] = 'correct'
    else unconsumed.set(ch, (unconsumed.get(ch) ?? 0) + 1)
  }

  for (let i = 0; i < g.length; i++) {
    if (result[i] === 'correct') continue
    const ch = g[i]!
    const left = unconsumed.get(ch) ?? 0
    if (left > 0) {
      result[i] = 'present'
      unconsumed.set(ch, left - 1)
    }
  }
  return result
}

const RANK: Record<TileState, number> = { absent: 0, present: 1, correct: 2 }

/**
 * The on-screen keyboard's color per letter: the BEST state that letter has
 * earned in any guess so far. A letter once green stays green even if a later
 * guess uses an extra copy of it that scores gray.
 */
export function keyboardStates(guesses: readonly string[], answer: string): Record<string, TileState> {
  const states: Record<string, TileState> = {}
  for (const guess of guesses) {
    const scored = scoreGuess(guess, answer)
    for (let i = 0; i < guess.length; i++) {
      const letter = guess[i]!.toLowerCase()
      const state = scored[i]!
      const prev = states[letter]
      if (prev === undefined || RANK[state] > RANK[prev]) states[letter] = state
    }
  }
  return states
}
