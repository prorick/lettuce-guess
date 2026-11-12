<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, shallowRef } from 'vue'
import AppHeader from './components/AppHeader.vue'
import GameBoard from './components/GameBoard.vue'
import GameKeyboard from './components/GameKeyboard.vue'
import HelpSheet from './components/HelpSheet.vue'
import ResultSheet from './components/ResultSheet.vue'
import ToastMessage from './components/ToastMessage.vue'
import { createRound, type Round } from './game/round'
import { answerForPuzzle, puzzleNumber, randomAnswer } from './game/daily'
import { keyboardStates } from './game/scoring'
import { recordDailyResult, type Stats } from './game/stats'
import { hasSeenHelp, loadDaily, loadStats, markHelpSeen, saveDaily, saveStats } from './game/storage'
import type { Mode } from './game/types'
import {
  applyThemeChoice,
  effectiveTheme,
  loadThemeChoice,
  saveThemeChoice,
  systemPrefersDark,
  type Theme,
} from './theme'

// Matches LetterTile's timing: 5 tiles × 260ms stagger + one 520ms flip.
const REVEAL_MS = 5 * 260 + 520
const PRAISE = ['Unbe-leaf-able!', 'Fresh!', 'Crisp!', 'Crunchy!', 'Phew, still crisp!', 'Saved by the salad!']

// ── State ────────────────────────────────────────────────────────────────
// ADR-0002: the daily is always the first game; random rounds unlock after it
// (win or lose), are never saved, and never touch stats.
const today = ref(puzzleNumber())
const mode = ref<Mode>('daily')
const stats = ref<Stats>(loadStats())

function dailyRound(): Round {
  return createRound(answerForPuzzle(today.value), loadDaily(today.value) ?? [])
}

const round = shallowRef<Round>(dailyRound())
const guesses = computed(() => round.value.guesses.value)
const current = computed(() => round.value.current.value)
const status = computed(() => round.value.status.value)
const scored = computed(() => round.value.scored.value)

/** How many guesses have finished revealing — the keyboard only colors those. */
const settled = ref(guesses.value.length)
const keyStates = computed(() => keyboardStates(guesses.value.slice(0, settled.value), round.value.answer))

const revealRow = ref<number | null>(null)
const winRow = computed(() => (status.value === 'won' && revealRow.value !== null ? guesses.value.length - 1 : null))
const shake = ref(false)
const busy = ref(false)
const toast = ref<string | null>(null)
const showHelp = ref(!hasSeenHelp())
const showResult = ref(status.value !== 'playing' && !showHelp.value)

const mood = computed(() => (status.value === 'won' ? 'cheer' : status.value === 'lost' ? 'sad' : 'happy'))
const subtitle = computed(() => (mode.value === 'daily' ? `Daily #${today.value}` : 'Random round · just for fun'))

// ── Actions ──────────────────────────────────────────────────────────────
let toastTimer: ReturnType<typeof setTimeout> | undefined
function flash(message: string, ms = 1600) {
  toast.value = message
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toast.value = null), ms)
}

function doShake() {
  shake.value = true
  setTimeout(() => (shake.value = false), 500)
}

function submit() {
  const result = round.value.submit()
  if (result === 'too-short') return (flash('Not enough letters'), doShake())
  if (result === 'not-a-word') return (flash('Not in our word list'), doShake())
  if (result !== 'ok') return

  const count = guesses.value.length
  const outcome = status.value
  revealRow.value = count - 1
  busy.value = true

  if (mode.value === 'daily') {
    saveDaily(today.value, guesses.value)
    if (outcome !== 'playing') {
      stats.value = recordDailyResult(stats.value, today.value, outcome === 'won', count)
      saveStats(stats.value)
    }
  }

  setTimeout(() => {
    settled.value = count
    busy.value = false
    if (outcome === 'won') {
      flash(PRAISE[count - 1] ?? 'Fresh!')
      setTimeout(() => (showResult.value = true), 1300)
    } else if (outcome === 'lost') {
      flash(round.value.answer.toUpperCase(), 2600)
      setTimeout(() => (showResult.value = true), 1700)
    }
  }, REVEAL_MS)
}

function onKey(key: string) {
  if (busy.value || showHelp.value || showResult.value) return
  if (key === 'enter') submit()
  else if (key === 'backspace') round.value.erase()
  else round.value.type(key)
}

function startRound(next: Round) {
  round.value = next
  settled.value = next.guesses.value.length
  revealRow.value = null
  showResult.value = false
}

function playRandom() {
  mode.value = 'random'
  startRound(createRound(randomAnswer([answerForPuzzle(today.value), round.value.answer])))
}

function backToDaily() {
  mode.value = 'daily'
  today.value = puzzleNumber()
  startRound(dailyRound())
  showResult.value = status.value !== 'playing'
}

/** Midnight rolled over while the page was open: grow a fresh daily. */
function checkNewDay() {
  if (mode.value !== 'daily' || puzzleNumber() === today.value) return
  today.value = puzzleNumber()
  startRound(dailyRound())
  flash('A fresh puzzle just grew! 🥬', 2200)
}

// ── Theme (ADR-0004): device decides until the player taps the toggle ─────
const theme = ref<Theme>(effectiveTheme(loadThemeChoice(), systemPrefersDark()))
function toggleTheme() {
  const next: Theme = theme.value === 'dark' ? 'light' : 'dark'
  saveThemeChoice(next)
  applyThemeChoice(next)
  theme.value = next
}
const darkQuery = globalThis.matchMedia?.('(prefers-color-scheme: dark)')
function onSystemTheme(e: MediaQueryListEvent) {
  // Only matters while the player hasn't chosen; keeps the toggle's icon honest.
  if (loadThemeChoice() === null) theme.value = e.matches ? 'dark' : 'light'
}

function closeHelp() {
  showHelp.value = false
  markHelpSeen()
  if (status.value !== 'playing') showResult.value = true
}

// ── Physical keyboard + day rollover ─────────────────────────────────────
function onKeydown(e: KeyboardEvent) {
  if (e.ctrlKey || e.metaKey || e.altKey) return
  if (showHelp.value || showResult.value) {
    if (e.key === 'Escape') {
      if (showHelp.value) closeHelp()
      else showResult.value = false
    }
    return
  }
  if (e.key === 'Enter') {
    e.preventDefault() // don't also "click" an on-screen key that still has focus
    onKey('enter')
  } else if (e.key === 'Backspace') {
    e.preventDefault()
    onKey('backspace')
  } else if (/^[a-zA-Z]$/.test(e.key)) {
    onKey(e.key.toLowerCase())
  }
}

function onVisible() {
  if (document.visibilityState === 'visible') checkNewDay()
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('focus', checkNewDay)
  document.addEventListener('visibilitychange', onVisible)
  darkQuery?.addEventListener('change', onSystemTheme)
})
onUnmounted(() => {
  darkQuery?.removeEventListener('change', onSystemTheme)
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('focus', checkNewDay)
  document.removeEventListener('visibilitychange', onVisible)
})
</script>

<template>
  <div class="app">
    <AppHeader
      :subtitle="subtitle"
      :mood="mood"
      :theme="theme"
      @help="showHelp = true"
      @stats="showResult = true"
      @toggle-theme="toggleTheme"
    />

    <main class="play">
      <GameBoard
        :guesses="guesses"
        :scored="scored"
        :current="current"
        :reveal-row="revealRow"
        :win-row="winRow"
        :shake="shake"
      />
      <button
        v-if="status !== 'playing' && !showResult"
        type="button"
        class="reopen"
        @click="showResult = true"
      >
        {{ mode === 'daily' ? "See results & play a random word" : 'See results' }}
      </button>
    </main>

    <GameKeyboard :key-states="keyStates" @key="onKey" />

    <footer class="foot">Fresh word every midnight · Made with Vue</footer>

    <ToastMessage :message="toast" />
    <HelpSheet v-if="showHelp" @close="closeHelp" />
    <ResultSheet
      v-if="showResult"
      :mode="mode"
      :status="status"
      :answer="round.answer"
      :guess-count="guesses.length"
      :stats="stats"
      :today="today"
      @close="showResult = false"
      @play-random="playRandom"
      @back-to-daily="backToDaily"
      @new-day="checkNewDay"
    />
  </div>
</template>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 100dvh;
  max-width: 520px;
  margin: 0 auto;
  padding: 0 12px max(12px, env(safe-area-inset-bottom));
}
.play {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 14px;
  padding: 6px 0;
}
.reopen {
  align-self: center;
  border: 2px solid var(--line-strong);
  border-radius: 999px;
  padding: 8px 16px;
  background: var(--surface);
  font-weight: 800;
  cursor: pointer;
}
.foot {
  text-align: center;
  font-size: 0.75rem;
  color: var(--ink-soft);
  padding-bottom: 4px;
}
</style>
