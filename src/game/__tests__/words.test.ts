import { describe, expect, it } from 'vitest'
import { ANSWERS, isValidGuess } from '../words'
import blocklistText from '../../../scripts/wordlist-blocklist.txt?raw'

// The word lists are GENERATED (scripts/build-wordlists.mjs). These tests check
// what a regeneration could silently break: an unguessable answer, a duplicate
// that skews the daily rotation, or a blocked word slipping back in.

describe('word lists', () => {
  it('accepts every possible answer as a guess — otherwise a puzzle would be unwinnable', () => {
    const unguessable = ANSWERS.filter((w) => !isValidGuess(w))
    expect(unguessable).toEqual([])
  })

  it('has no duplicate answers, so the daily rotation never repeats a word early', () => {
    expect(new Set(ANSWERS).size).toBe(ANSWERS.length)
  })

  it('has only five-letter lowercase answers', () => {
    expect(ANSWERS.filter((w) => !/^[a-z]{5}$/.test(w))).toEqual([])
  })

  it('accepts common opening words people actually type', () => {
    for (const w of ['crane', 'slate', 'adieu', 'audio', 'raise', 'STARE']) {
      expect(isValidGuess(w), w).toBe(true)
    }
  })

  it('rejects letter soup', () => {
    expect(isValidGuess('aeiou')).toBe(false)
    expect(isValidGuess('qzxjv')).toBe(false)
  })

  it('never uses a blocklisted word as an answer, and rejects [everywhere] words as guesses', () => {
    const text: string = blocklistText
    let section = ''
    const everywhere: string[] = []
    const answersOnly: string[] = []
    for (const raw of text.split('\n')) {
      const line = raw.replace(/#.*/, '').trim()
      if (!line) continue
      if (line.startsWith('[')) section = line
      else (section === '[everywhere]' ? everywhere : answersOnly).push(line)
    }
    const answerSet = new Set(ANSWERS)
    expect([...everywhere, ...answersOnly].filter((w) => answerSet.has(w))).toEqual([])
    expect(everywhere.filter((w) => isValidGuess(w))).toEqual([])
  })
})
