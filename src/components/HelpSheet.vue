<script setup lang="ts">
import ModalSheet from './ModalSheet.vue'
import LetterTile from './LetterTile.vue'
import type { TileState } from '@/game/types'

const emit = defineEmits<{ close: [] }>()

// SCOWL's license asks that its notice travel with copies of its output.
const scowlNotice = `${import.meta.env.BASE_URL}licenses/SCOWL-COPYRIGHT.txt`

const examples: { word: string; at: number; state: TileState; text: string }[] = [
  { word: 'leafy', at: 0, state: 'correct', text: 'L is in the word and in the right spot.' },
  { word: 'salad', at: 1, state: 'present', text: 'A is in the word, but in a different spot.' },
  { word: 'crisp', at: 4, state: 'absent', text: 'P is not in the word at all.' },
]
</script>

<template>
  <ModalSheet title="How to play" @close="emit('close')">
    <p class="lead">Guess the five-letter word in six tries. Each guess must be a real word; press Enter to submit.</p>
    <p class="lead">After each guess, the tiles show how close you were:</p>
    <div v-for="ex in examples" :key="ex.word" class="example">
      <div class="tiles">
        <LetterTile
          v-for="(ch, i) in ex.word"
          :key="i"
          small
          :letter="ch"
          :state="i === ex.at ? ex.state : undefined"
        />
      </div>
      <p>{{ ex.text }}</p>
    </div>
    <p class="note">
      🥬 Everyone gets the same puzzle each day. A fresh one grows at midnight. Once you finish
      today's, you can play random words just for fun.
    </p>
    <p class="credit">
      Word lists derived from <a href="http://wordlist.aspell.net/" target="_blank" rel="noopener">SCOWL</a>
      (<a :href="scowlNotice" target="_blank" rel="noopener">copyright notice</a>).
    </p>
  </ModalSheet>
</template>

<style scoped>
.lead {
  margin: 0 0 10px;
  line-height: 1.45;
}
.example {
  margin: 14px 0;
}
.example p {
  margin: 6px 0 0;
  font-size: 0.95rem;
  color: var(--ink-soft);
}
.tiles {
  display: flex;
  gap: 5px;
}
.note {
  margin: 16px 0 0;
  padding: 12px 14px;
  border-radius: 14px;
  background: var(--bg);
  font-size: 0.92rem;
  line-height: 1.45;
}
.credit {
  margin: 12px 0 0;
  font-size: 0.78rem;
  color: var(--ink-soft);
  text-align: center;
}
.credit a {
  color: inherit;
}
</style>
