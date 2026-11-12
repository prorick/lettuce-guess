<script setup lang="ts">
import type { TileState } from '@/game/types'

defineProps<{ keyStates: Record<string, TileState> }>()
const emit = defineEmits<{ key: [key: string] }>()

const ROWS: string[][] = [
  [...'qwertyuiop'],
  [...'asdfghjkl'],
  ['enter', ...'zxcvbnm', 'backspace'],
]
</script>

<template>
  <div class="keyboard" role="group" aria-label="Keyboard">
    <div v-for="(row, r) in ROWS" :key="r" class="row">
      <button
        v-for="k in row"
        :key="k"
        type="button"
        class="key"
        :class="[keyStates[k], { wide: k.length > 1 }]"
        :aria-label="k === 'backspace' ? 'Delete letter' : k === 'enter' ? 'Submit guess' : k.toUpperCase()"
        @click="emit('key', k)"
      >
        <svg v-if="k === 'backspace'" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <path
            d="M9 5h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-6-7 6-7zM12 9l6 6M18 9l-6 6"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <template v-else-if="k === 'enter'">Enter</template>
        <template v-else>{{ k.toUpperCase() }}</template>
      </button>
    </div>
  </div>
</template>

<style scoped>
.keyboard {
  display: grid;
  gap: 8px;
  width: min(100%, 500px);
  margin: 0 auto;
  user-select: none;
}
.row {
  display: flex;
  gap: 6px;
  justify-content: center;
}
.row:nth-child(2) {
  padding: 0 4.5%;
}
.key {
  flex: 1 1 0;
  min-width: 0;
  height: 54px;
  border: 0;
  border-radius: 10px;
  background: var(--key);
  color: var(--key-ink);
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1.05rem;
  cursor: pointer;
  box-shadow: inset 0 -3px 0 rgb(0 0 0 / 0.09);
  display: grid;
  place-items: center;
  transition:
    transform 80ms ease,
    background-color 200ms ease;
}
.key:active {
  transform: translateY(2px);
}
.wide {
  flex-grow: 1.6;
  font-size: 0.85rem;
}
.correct {
  background: var(--lettuce);
  color: var(--lettuce-ink);
}
.present {
  background: var(--squash);
  color: var(--squash-ink);
}
.absent {
  background: var(--crouton);
  color: var(--crouton-ink);
  opacity: 0.8;
}
@media (max-width: 380px) {
  .row {
    gap: 4px;
  }
  .key {
    height: 50px;
    font-size: 0.95rem;
  }
}
</style>
