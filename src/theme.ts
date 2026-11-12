import { browserStore, type KeyValueStore } from './game/storage'

/**
 * Light/dark theme (ADR-0004). Until the player taps the toggle, the device's
 * `prefers-color-scheme` decides and <html> carries no data-theme. Once they
 * choose, the choice is stored and set as <html data-theme="…">, which
 * base.css lets override the device.
 *
 * Stored as a bare string (not JSON) so the inline pre-paint script in
 * index.html can read it with no parsing. Keep that script's key in sync.
 */
export type Theme = 'light' | 'dark'

export const THEME_KEY = 'lettuce-guess:theme:v1'

const THEME_COLOR: Record<Theme, string> = { light: '#fbf6ea', dark: '#151c12' }

export function loadThemeChoice(store: KeyValueStore | undefined = browserStore()): Theme | null {
  try {
    const v = store?.getItem(THEME_KEY)
    return v === 'light' || v === 'dark' ? v : null
  } catch {
    return null
  }
}

export function saveThemeChoice(theme: Theme, store: KeyValueStore | undefined = browserStore()): void {
  try {
    store?.setItem(THEME_KEY, theme)
  } catch {
    /* can't remember it — the toggle still works for this visit */
  }
}

export function systemPrefersDark(): boolean {
  try {
    return globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
  } catch {
    return false
  }
}

/** What the page should look like: an explicit choice beats the device. */
export function effectiveTheme(choice: Theme | null, systemDark: boolean): Theme {
  return choice ?? (systemDark ? 'dark' : 'light')
}

/** Pin the page to a chosen theme (also recolors the mobile browser's toolbar). */
export function applyThemeChoice(theme: Theme): void {
  document.documentElement.dataset.theme = theme
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute('content', THEME_COLOR[theme]))
}
