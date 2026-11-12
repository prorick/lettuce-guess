import { describe, expect, it } from 'vitest'
import { answerForPuzzle, msUntilNextPuzzle, puzzleNumber, randomAnswer } from '../daily'
import { ANSWERS } from '../words'

// These run with TZ=America/New_York (see package.json "test"), so the DST
// cases below cross a real 23-hour and 25-hour day.

describe('puzzleNumber', () => {
  it('is #1 on launch day, morning and night', () => {
    expect(puzzleNumber(new Date(2026, 10, 11, 0, 0, 1))).toBe(1)
    expect(puzzleNumber(new Date(2026, 10, 11, 23, 59, 59))).toBe(1)
  })

  it('advances exactly at local midnight', () => {
    expect(puzzleNumber(new Date(2026, 10, 12, 0, 0, 0))).toBe(2)
  })

  it('advances by exactly one across the spring-forward night (23-hour day)', () => {
    // US DST starts 2027-03-14 02:00.
    const before = puzzleNumber(new Date(2027, 2, 13, 23, 30))
    const after = puzzleNumber(new Date(2027, 2, 14, 23, 30))
    expect(after - before).toBe(1)
  })

  it('advances by exactly one across the fall-back night (25-hour day)', () => {
    // US DST ends 2026-11-01 02:00 — before launch, so test the 2027 one: 2027-11-07.
    const before = puzzleNumber(new Date(2027, 10, 6, 0, 30))
    const after = puzzleNumber(new Date(2027, 10, 7, 0, 30))
    const dayAfter = puzzleNumber(new Date(2027, 10, 8, 0, 30))
    expect([after - before, dayAfter - after]).toEqual([1, 1])
  })

  it('never goes below #1 when a device clock is set before launch', () => {
    expect(puzzleNumber(new Date(2020, 0, 1))).toBe(1)
  })
})

describe('daily answers', () => {
  it('gives everyone the same word for the same day', () => {
    const morning = answerForPuzzle(puzzleNumber(new Date(2026, 11, 25, 7)))
    const night = answerForPuzzle(puzzleNumber(new Date(2026, 11, 25, 22)))
    expect(morning).toBe(night)
  })

  it('wraps around instead of crashing once every answer has been used', () => {
    expect(answerForPuzzle(ANSWERS.length + 1)).toBe(answerForPuzzle(1))
  })
})

describe('randomAnswer', () => {
  it("never hands back today's daily word in a for-fun round", () => {
    const today = answerForPuzzle(1)
    const tiny = [today, 'lemon']
    for (let i = 0; i < 20; i++) {
      expect(randomAnswer([today], () => i / 20, tiny)).toBe('lemon')
    }
  })
})

describe('msUntilNextPuzzle', () => {
  it('counts down to local midnight', () => {
    expect(msUntilNextPuzzle(new Date(2026, 10, 11, 23, 0, 0))).toBe(60 * 60 * 1000)
  })
})
