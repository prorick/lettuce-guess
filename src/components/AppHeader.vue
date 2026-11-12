<script setup lang="ts">
import LettuceMascot from './LettuceMascot.vue'
import type { Theme } from '@/theme'

defineProps<{ subtitle: string; mood: 'happy' | 'cheer' | 'sad'; theme: Theme }>()
const emit = defineEmits<{ help: []; stats: []; toggleTheme: [] }>()
</script>

<template>
  <header class="header">
    <button type="button" class="icon" aria-label="How to play" @click="emit('help')">?</button>
    <div class="brand">
      <LettuceMascot class="mascot" :size="42" :mood="mood" />
      <div>
        <h1 class="title">Lettuce <span>Guess</span></h1>
        <p class="subtitle">{{ subtitle }}</p>
      </div>
    </div>
    <div class="right">
      <button
        type="button"
        class="icon"
        :aria-label="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
        :title="theme === 'dark' ? 'Light mode' : 'Dark mode'"
        @click="emit('toggleTheme')"
      >
        <!-- Show where the tap takes you: a moon in light mode, a sun in dark mode. -->
        <svg v-if="theme === 'dark'" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <circle cx="12" cy="12" r="4.5" fill="currentColor" />
          <path
            d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
        <svg v-else viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" fill="currentColor" />
        </svg>
      </button>
      <button type="button" class="icon" aria-label="Your stats" @click="emit('stats')">
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path d="M5 20V12M12 20V5M19 20v-9" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
        </svg>
      </button>
    </div>
  </header>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: min(100%, 500px);
  margin: 0 auto;
  padding: 10px 0 6px;
}
.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.right {
  display: flex;
  gap: 6px;
}
.title {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(1.3rem, 6.4vw, 1.7rem);
  letter-spacing: 0.01em;
  line-height: 1;
  white-space: nowrap;
  color: var(--brand);
}
.title span {
  color: var(--ink);
}
.subtitle {
  margin: 4px 0 0;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--ink-soft);
  white-space: nowrap;
}
.icon {
  flex: none;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 2px solid var(--line);
  background: var(--surface);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.2rem;
  cursor: pointer;
  display: grid;
  place-items: center;
  color: var(--ink-soft);
}
.icon:hover {
  border-color: var(--line-strong);
  color: var(--ink);
}
@media (max-width: 360px) {
  .mascot {
    display: none;
  }
}
</style>
