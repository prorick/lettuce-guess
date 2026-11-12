<script setup lang="ts">
import LettuceMascot from './LettuceMascot.vue'

defineProps<{ subtitle: string; mood: 'happy' | 'cheer' | 'sad' }>()
const emit = defineEmits<{ help: []; stats: [] }>()
</script>

<template>
  <header class="header">
    <button type="button" class="icon" aria-label="How to play" @click="emit('help')">?</button>
    <div class="brand">
      <LettuceMascot :size="42" :mood="mood" />
      <div>
        <h1 class="title">Lettuce <span>Guess</span></h1>
        <p class="subtitle">{{ subtitle }}</p>
      </div>
    </div>
    <button type="button" class="icon" aria-label="Your stats" @click="emit('stats')">
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path d="M5 20V12M12 20V5M19 20v-9" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
      </svg>
    </button>
  </header>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: min(100%, 500px);
  margin: 0 auto;
  padding: 10px 0 6px;
}
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}
.title {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.7rem;
  letter-spacing: 0.01em;
  line-height: 1;
  color: var(--lettuce-deep);
}
.title span {
  color: var(--ink);
}
@media (prefers-color-scheme: dark) {
  .title {
    color: var(--lettuce);
  }
}
.subtitle {
  margin: 4px 0 0;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--ink-soft);
}
.icon {
  width: 40px;
  height: 40px;
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
</style>
