/** Feedback for one letter of a guess. */
export type TileState = 'correct' | 'present' | 'absent'

export type GameStatus = 'playing' | 'won' | 'lost'

/** Daily = the shared puzzle; random = "for fun" rounds after it (ADR-0002). */
export type Mode = 'daily' | 'random'

export const WORD_LENGTH = 5
export const MAX_GUESSES = 6
