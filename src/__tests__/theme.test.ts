import { describe, expect, it } from 'vitest'
import { effectiveTheme, loadThemeChoice, saveThemeChoice, THEME_KEY } from '../theme'
import type { KeyValueStore } from '../game/storage'

const memory = (data: Record<string, string> = {}): KeyValueStore => ({
  getItem: (k) => data[k] ?? null,
  setItem: (k, v) => {
    data[k] = v
  },
})

describe('theme choice (ADR-0004)', () => {
  it('follows the device until the player chooses', () => {
    expect(effectiveTheme(null, true)).toBe('dark')
    expect(effectiveTheme(null, false)).toBe('light')
  })

  it("lets a player on a light-mode phone pick dark, and keeps it after a reload", () => {
    const store = memory()
    saveThemeChoice('dark', store)
    expect(effectiveTheme(loadThemeChoice(store), false)).toBe('dark')
  })

  it('lets a player on a dark-mode laptop pick light', () => {
    const store = memory()
    saveThemeChoice('light', store)
    expect(effectiveTheme(loadThemeChoice(store), true)).toBe('light')
  })

  it('ignores a junk stored value and falls back to the device', () => {
    expect(loadThemeChoice(memory({ [THEME_KEY]: 'purple' }))).toBeNull()
  })

  it('works with storage blocked (private window)', () => {
    const blocked: KeyValueStore = {
      getItem: () => {
        throw new Error('SecurityError')
      },
      setItem: () => {
        throw new Error('SecurityError')
      },
    }
    expect(() => saveThemeChoice('dark', blocked)).not.toThrow()
    expect(loadThemeChoice(blocked)).toBeNull()
  })
})
