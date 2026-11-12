<script setup lang="ts">
withDefaults(defineProps<{ size?: number; mood?: 'happy' | 'cheer' | 'sad' }>(), {
  size: 44,
  mood: 'happy',
})
</script>

<template>
  <svg
    class="mascot"
    :class="mood"
    :width="size"
    :height="size"
    viewBox="0 0 64 64"
    role="img"
    aria-label="Lettuce Guess mascot: a smiling lettuce leaf"
  >
    <path
      class="leaf"
      d="M32 5c5 0 8 4 12 5s10 0 12 6-2 9-1 13 5 8 1 14-10 6-13 8-6 6-11 6-8-4-12-5-11-1-13-7 1-10 0-14-5-9-1-14 8-3 11-6 9-6 15-6z"
    />
    <path class="vein" d="M32 14v20M32 24l-7-5M32 24l7-5" />
    <circle class="eye" cx="25" cy="36" r="3" />
    <circle class="eye" cx="39" cy="36" r="3" />
    <ellipse class="blush" cx="20" cy="42" rx="3.5" ry="2" />
    <ellipse class="blush" cx="44" cy="42" rx="3.5" ry="2" />
    <path v-if="mood === 'sad'" class="mouth" d="M27 46q5-4 10 0" />
    <path v-else-if="mood === 'cheer'" class="mouth open" d="M26 42q6 9 12 0z" />
    <path v-else class="mouth" d="M27 42q5 5 10 0" />
  </svg>
</template>

<style scoped>
.mascot {
  display: block;
  flex: none;
}
.leaf {
  fill: var(--lettuce);
  stroke: var(--lettuce-deep);
  stroke-width: 3;
  stroke-linejoin: round;
}
.vein {
  fill: none;
  stroke: var(--lettuce-deep);
  stroke-width: 2;
  stroke-linecap: round;
  opacity: 0.55;
}
.eye {
  fill: var(--lettuce-ink);
}
.blush {
  fill: #f29a8b;
  opacity: 0.7;
}
.mouth {
  fill: none;
  stroke: var(--lettuce-ink);
  stroke-width: 2.5;
  stroke-linecap: round;
}
.mouth.open {
  fill: var(--lettuce-ink);
}
.cheer {
  animation: wiggle 900ms ease-in-out 2;
}
@keyframes wiggle {
  0%,
  100% {
    transform: rotate(0);
  }
  25% {
    transform: rotate(-8deg);
  }
  75% {
    transform: rotate(8deg);
  }
}
</style>
