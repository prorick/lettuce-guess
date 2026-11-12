import { describe, expect, it } from 'vitest'
import { keyboardStates, scoreGuess } from '../scoring'

// Duplicate letters are the bug class we most expect (CLAUDE.md, Fifth Directive;
// ADR-0001 Explicitation item 3): one-pass scoring looks right in casual play
// and only fails on particular word pairs — exactly the pairs below.

describe('scoreGuess', () => {
  it('marks every letter correct when the guess is the answer', () => {
    expect(scoreGuess('lemon', 'lemon')).toEqual(['correct', 'correct', 'correct', 'correct', 'correct'])
  })

  it('colors only one T when the guess has two and the answer has one (ATTIC vs STACK)', () => {
    // The green T at position 2 consumes the answer's only T; the second T must be gray.
    expect(scoreGuess('attic', 'stack')).toEqual(['present', 'correct', 'absent', 'absent', 'present'])
  })

  it('gives yellow to the first extra copy only, never to both (SPEED vs ABIDE)', () => {
    // ABIDE has one E: the first E of SPEED is yellow, the second gray.
    expect(scoreGuess('speed', 'abide')).toEqual(['absent', 'absent', 'present', 'absent', 'present'])
  })

  it('lets a later green claim its letter before an earlier yellow does (EERIE vs THEME)', () => {
    // THEME has two Es. The final E is green; one E remains, so the FIRST E is yellow
    // and the second gray. A left-to-right single pass would make both early Es yellow.
    expect(scoreGuess('eerie', 'theme')).toEqual(['present', 'absent', 'absent', 'absent', 'correct'])
  })

  it('handles a doubled letter in the answer (LLAMA guessed against ALLOY)', () => {
    expect(scoreGuess('llama', 'alloy')).toEqual(['present', 'correct', 'present', 'absent', 'absent'])
  })

  it('ignores letter case, since the keyboard and storage may differ', () => {
    expect(scoreGuess('CRANE', 'crane')).toEqual(scoreGuess('crane', 'CRANE'))
  })
})

describe('keyboardStates', () => {
  it('keeps a key green after a later guess scores an extra copy of that letter gray', () => {
    // Guess 1 finds T in the right spot; guess 2 ATTIC has a second T that scores gray.
    const keys = keyboardStates(['stamp', 'attic'], 'stack')
    expect(keys.t).toBe('correct')
  })

  it('upgrades a key from yellow to green once the letter is placed', () => {
    const keys = keyboardStates(['about', 'crane'], 'stack')
    expect(keys.a).toBe('correct') // yellow in ABOUT, green in CRANE
    expect(keys.r).toBe('absent')
  })
})
