<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import ModalSheet from './ModalSheet.vue'
import { displayedStreak, winPercent, type Stats } from '@/game/stats'
import { msUntilNextPuzzle } from '@/game/daily'
import type { GameStatus, Mode } from '@/game/types'

const props = defineProps<{
  mode: Mode
  status: GameStatus
  answer: string
  guessCount: number
  stats: Stats
  today: number
}>()
const emit = defineEmits<{ close: []; playRandom: []; backToDaily: []; newDay: [] }>()

const finished = computed(() => props.status !== 'playing')
const title = computed(() => {
  if (!finished.value) return 'Your stats'
  if (props.status === 'won') return props.mode === 'daily' ? 'Fresh pick! 🥬' : 'Nice one!'
  return 'So close!'
})

const maxBar = computed(() => Math.max(1, ...props.stats.distribution))
const streak = computed(() => displayedStreak(props.stats, props.today))

const remaining = ref(msUntilNextPuzzle())
let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  timer = setInterval(() => {
    remaining.value = msUntilNextPuzzle()
    if (remaining.value < 1000) emit('newDay')
  }, 1000)
})
onUnmounted(() => clearInterval(timer))

const countdown = computed(() => {
  const s = Math.floor(remaining.value / 1000)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`
})
</script>

<template>
  <ModalSheet :title="title" @close="emit('close')">
    <p v-if="finished" class="answer">
      <template v-if="status === 'won'">
        You got <strong>{{ answer.toUpperCase() }}</strong> in {{ guessCount }}
        {{ guessCount === 1 ? 'guess' : 'guesses' }}.
      </template>
      <template v-else>
        The word was <strong>{{ answer.toUpperCase() }}</strong>.
      </template>
    </p>

    <div class="numbers" aria-label="Daily stats">
      <div><b>{{ stats.played }}</b><span>Played</span></div>
      <div><b>{{ winPercent(stats) }}</b><span>Win %</span></div>
      <div><b>{{ streak }}</b><span>Streak</span></div>
      <div><b>{{ stats.maxStreak }}</b><span>Best</span></div>
    </div>

    <h3 class="sub">Daily guess distribution</h3>
    <ol class="bars">
      <li v-for="(n, i) in stats.distribution" :key="i">
        <span class="n">{{ i + 1 }}</span>
        <span
          class="bar"
          :class="{ hit: mode === 'daily' && status === 'won' && guessCount === i + 1 }"
          :style="{ width: `${Math.max(8, (n / maxBar) * 100)}%` }"
          >{{ n }}</span
        >
      </li>
    </ol>
    <p v-if="mode === 'random'" class="fine">Random rounds are just for fun and don't change your daily stats.</p>

    <div class="actions">
      <template v-if="mode === 'daily' && finished">
        <p class="next">Next daily in <strong class="mono">{{ countdown }}</strong></p>
        <button type="button" class="btn" @click="emit('playRandom')">Play a random word</button>
      </template>
      <template v-else-if="mode === 'random' && finished">
        <button type="button" class="btn" @click="emit('playRandom')">Another one?</button>
        <button type="button" class="btn ghost" @click="emit('backToDaily')">Back to today's puzzle</button>
      </template>
    </div>
  </ModalSheet>
</template>

<style scoped>
.answer {
  margin: 0 0 16px;
  text-align: center;
  font-size: 1.05rem;
}
.answer strong {
  font-family: var(--font-display);
  letter-spacing: 0.08em;
  color: var(--brand);
}
.numbers {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  text-align: center;
  gap: 4px;
}
.numbers b {
  display: block;
  font-family: var(--font-display);
  font-size: 1.8rem;
  line-height: 1.1;
}
.numbers span {
  font-size: 0.75rem;
  color: var(--ink-soft);
}
.sub {
  margin: 18px 0 8px;
  font-size: 0.9rem;
  font-weight: 800;
  text-align: center;
}
.bars {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 5px;
}
.bars li {
  display: flex;
  align-items: center;
  gap: 8px;
}
.n {
  width: 1ch;
  font-weight: 800;
  font-size: 0.85rem;
}
.bar {
  min-width: 1.8rem;
  padding: 2px 8px;
  border-radius: 8px;
  background: var(--crouton);
  color: var(--crouton-ink);
  font-weight: 800;
  font-size: 0.85rem;
  text-align: right;
  transition: width 400ms ease;
}
.bar.hit {
  background: var(--lettuce);
  color: var(--lettuce-ink);
}
.fine {
  margin: 12px 0 0;
  font-size: 0.82rem;
  text-align: center;
  color: var(--ink-soft);
}
.actions {
  display: grid;
  gap: 10px;
  margin-top: 18px;
}
.next {
  margin: 0;
  text-align: center;
  color: var(--ink-soft);
}
.mono {
  font-variant-numeric: tabular-nums;
  color: var(--ink);
}
.btn {
  border: 0;
  border-radius: 999px;
  padding: 13px 18px;
  background: var(--btn-bg);
  color: var(--btn-ink);
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1.05rem;
  cursor: pointer;
  box-shadow: inset 0 -3px 0 rgb(0 0 0 / 0.15);
}
.btn:active {
  transform: translateY(1px);
}
.ghost {
  background: transparent;
  color: var(--ink);
  border: 2px solid var(--line-strong);
  box-shadow: none;
}
</style>
