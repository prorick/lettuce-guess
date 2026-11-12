import { describe, expect, it } from 'vitest'
import { createRound } from '../round'

function typeWord(round: ReturnType<typeof createRound>, word: string) {
  for (const ch of word) round.type(ch)
}

describe('a round of play', () => {
  it('does not use up a guess when the word is not in the list', () => {
    const round = createRound('lemon')
    typeWord(round, 'qzxjv')
    expect(round.submit()).toBe('not-a-word')
    expect(round.guesses.value).toEqual([])
    expect(round.current.value).toBe('qzxjv') // left in place so the player can fix it
  })

  it('refuses to submit fewer than five letters', () => {
    const round = createRound('lemon')
    typeWord(round, 'lem')
    expect(round.submit()).toBe('too-short')
    expect(round.guesses.value).toEqual([])
  })

  it('stops accepting letters past the fifth', () => {
    const round = createRound('lemon')
    typeWord(round, 'lemonade')
    expect(round.current.value).toBe('lemon')
  })

  it('is won on the guess that matches, and then ignores input', () => {
    const round = createRound('lemon')
    typeWord(round, 'crane')
    round.submit()
    typeWord(round, 'lemon')
    expect(round.submit()).toBe('ok')
    expect(round.status.value).toBe('won')
    round.type('a')
    expect(round.current.value).toBe('')
  })

  it('is lost after six wrong guesses', () => {
    const round = createRound('lemon')
    for (const w of ['crane', 'stoic', 'plumb', 'dwarf', 'fight', 'jazzy']) {
      typeWord(round, w)
      expect(round.submit()).toBe('ok')
    }
    expect(round.status.value).toBe('lost')
  })

  it('restores a finished daily from its saved guesses', () => {
    const round = createRound('lemon', ['crane', 'lemon'])
    expect(round.status.value).toBe('won')
    expect(round.scored.value).toHaveLength(2)
  })
})
