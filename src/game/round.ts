import { computed, ref } from 'vue'
import { scoreGuess } from './scoring'
import { isValidGuess } from './words'
import { MAX_GUESSES, WORD_LENGTH, type GameStatus } from './types'

export type SubmitResult = 'ok' | 'too-short' | 'not-a-word' | 'finished'

/**
 * One round of play against a fixed answer. Daily and random rounds are the
 * same engine — they differ only in where `answer` came from (ADR-0002).
 * The whole state is the list of guesses; status is derived from it, so a
 * saved daily restores by replaying its guesses.
 */
export function createRound(answer: string, initialGuesses: readonly string[] = []) {
  const target = answer.toLowerCase()
  const guesses = ref<string[]>(initialGuesses.map((g) => g.toLowerCase()))
  const current = ref('')

  const status = computed<GameStatus>(() => {
    if (guesses.value[guesses.value.length - 1] === target) return 'won'
    if (guesses.value.length >= MAX_GUESSES) return 'lost'
    return 'playing'
  })

  const scored = computed(() => guesses.value.map((g) => scoreGuess(g, target)))

  function type(letter: string): void {
    const l = letter.toLowerCase()
    if (status.value !== 'playing' || !/^[a-z]$/.test(l)) return
    if (current.value.length < WORD_LENGTH) current.value += l
  }

  function erase(): void {
    if (status.value !== 'playing') return
    current.value = current.value.slice(0, -1)
  }

  /** Try to commit the typed word. Only an `ok` result uses up a guess. */
  function submit(): SubmitResult {
    if (status.value !== 'playing') return 'finished'
    if (current.value.length < WORD_LENGTH) return 'too-short'
    if (!isValidGuess(current.value)) return 'not-a-word'
    guesses.value = [...guesses.value, current.value]
    current.value = ''
    return 'ok'
  }

  return { answer: target, guesses, current, status, scored, type, erase, submit }
}

export type Round = ReturnType<typeof createRound>
