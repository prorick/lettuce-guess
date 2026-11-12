<script setup lang="ts">
import { computed } from 'vue'
import type { TileState } from '@/game/types'

const props = withDefaults(
  defineProps<{
    letter?: string
    state?: TileState
    /** Flip-reveal this tile (only the row just submitted — restored rows appear instantly). */
    reveal?: boolean
    /** Position in the row: staggers the flip. */
    index?: number
    bounce?: boolean
    small?: boolean
  }>(),
  { letter: '', reveal: false, index: 0, bounce: false, small: false },
)

const LABEL: Record<TileState, string> = {
  correct: 'right spot',
  present: 'in the word, wrong spot',
  absent: 'not in the word',
}

const ariaLabel = computed(() => {
  if (!props.letter) return 'empty'
  const l = props.letter.toUpperCase()
  return props.state ? `${l}, ${LABEL[props.state]}` : l
})
</script>

<template>
  <div
    class="tile"
    :class="[state, { filled: letter && !state, reveal, bounce, small }]"
    :style="{ '--i': index }"
    role="img"
    :aria-label="ariaLabel"
  >
    <span class="letter" aria-hidden="true">{{ letter.toUpperCase() }}</span>
    <!-- Color is never the only signal: a leaf for "right spot", a seed for "wrong spot". -->
    <svg v-if="state === 'correct'" class="mark" viewBox="0 0 12 12" aria-hidden="true">
      <path d="M2 10C2 5 5 2 10 2c0 5-3 8-8 8zM3 9l4-4" />
    </svg>
    <svg v-else-if="state === 'present'" class="mark" viewBox="0 0 12 12" aria-hidden="true">
      <ellipse cx="6" cy="6" rx="2.6" ry="3.6" />
    </svg>
  </div>
</template>

<style scoped>
.tile {
  --flip: 520ms;
  --step: 260ms;
  position: relative;
  display: grid;
  place-items: center;
  aspect-ratio: 1;
  width: 100%;
  border-radius: 14px;
  border: 2px solid var(--line);
  background: var(--surface);
  color: var(--ink);
  font-family: var(--font-display);
  font-weight: 600;
  font-size: clamp(1.5rem, 7vw, 2.1rem);
  line-height: 1;
  user-select: none;
}
.small {
  border-radius: 10px;
  font-size: 1.25rem;
  width: 2.6rem;
}

.filled {
  border-color: var(--line-strong);
  animation: pop 110ms ease-out;
}

.correct,
.present,
.absent {
  border-color: transparent;
  box-shadow: inset 0 -4px 0 rgb(0 0 0 / 0.08);
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
}

/* Reveal: flip, and switch colors at the half-turn when the tile is edge-on. */
.reveal {
  animation: flip var(--flip) ease-in-out both;
  animation-delay: calc(var(--i) * var(--step));
  transition:
    background-color 0s linear calc(var(--i) * var(--step) + var(--flip) / 2),
    color 0s linear calc(var(--i) * var(--step) + var(--flip) / 2),
    border-color 0s linear calc(var(--i) * var(--step) + var(--flip) / 2),
    box-shadow 0s linear calc(var(--i) * var(--step) + var(--flip) / 2);
}
.reveal .mark {
  animation: appear 1ms linear both;
  animation-delay: calc(var(--i) * var(--step) + var(--flip) / 2);
}

.bounce {
  animation: hop 520ms ease-out both;
  animation-delay: calc(5 * var(--step) + var(--flip) + var(--i) * 90ms);
}

.mark {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 11px;
  height: 11px;
  opacity: 0.75;
}
.correct .mark path {
  fill: var(--lettuce-ink);
  stroke: var(--lettuce);
  stroke-width: 1;
}
.present .mark ellipse {
  fill: var(--squash-ink);
}

@keyframes pop {
  50% {
    transform: scale(1.08);
  }
}
@keyframes flip {
  0% {
    transform: rotateX(0);
  }
  50% {
    transform: rotateX(90deg);
  }
  100% {
    transform: rotateX(0);
  }
}
@keyframes appear {
  from {
    opacity: 0;
  }
  to {
    opacity: 0.75;
  }
}
@keyframes hop {
  0%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-14px);
  }
  70% {
    transform: translateY(3px);
  }
}
</style>
