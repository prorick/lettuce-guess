import { ANSWERS } from '@/words/answers'
import { EXTRA_GUESSES } from '@/words/guesses'

// Both lists are generated from SCOWL by scripts/build-wordlists.mjs (ADR-0001).
const VALID = new Set<string>([...ANSWERS, ...EXTRA_GUESSES])

export { ANSWERS }

/** True if the game accepts this word as a guess (any case). */
export function isValidGuess(word: string): boolean {
  return VALID.has(word.toLowerCase())
}
