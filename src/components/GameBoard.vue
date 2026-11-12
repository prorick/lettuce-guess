<script setup lang="ts">
import { computed } from 'vue'
import LetterTile from './LetterTile.vue'
import { MAX_GUESSES, WORD_LENGTH, type TileState } from '@/game/types'

const props = defineProps<{
  guesses: readonly string[]
  scored: readonly TileState[][]
  current: string
  /** Index of the row that was just submitted and should flip; null = no animation. */
  revealRow: number | null
  /** Index of the winning row, to hop after its reveal. */
  winRow: number | null
  shake: boolean
}>()

interface Cell {
  letter: string
  state?: TileState
}

const rows = computed<Cell[][]>(() =>
  Array.from({ length: MAX_GUESSES }, (_, r) => {
    const word = r < props.guesses.length ? props.guesses[r]! : r === props.guesses.length ? props.current : ''
    const states = r < props.guesses.length ? props.scored[r] : undefined
    return Array.from({ length: WORD_LENGTH }, (_, c) => ({ letter: word[c] ?? '', state: states?.[c] }))
  }),
)
</script>

<template>
  <div class="board" role="group" aria-label="Guesses">
    <div
      v-for="(row, r) in rows"
      :key="r"
      class="row"
      :class="{ shake: shake && r === guesses.length }"
      role="group"
      :aria-label="`Guess ${r + 1}`"
    >
      <LetterTile
        v-for="(cell, c) in row"
        :key="c"
        :letter="cell.letter"
        :state="cell.state"
        :index="c"
        :reveal="r === revealRow"
        :bounce="r === winRow"
      />
    </div>
  </div>
</template>

<style scoped>
.board {
  display: grid;
  grid-template-rows: repeat(6, 1fr);
  gap: 7px;
  width: min(100%, 340px);
  margin: 0 auto;
  perspective: 800px;
}
.row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 7px;
}
.shake {
  animation: shake 480ms ease-in-out;
}
@keyframes shake {
  10%,
  90% {
    transform: translateX(-2px);
  }
  20%,
  80% {
    transform: translateX(4px);
  }
  30%,
  50%,
  70% {
    transform: translateX(-7px);
  }
  40%,
  60% {
    transform: translateX(7px);
  }
}
</style>
