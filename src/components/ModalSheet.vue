<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'

defineProps<{ title: string }>()
const emit = defineEmits<{ close: [] }>()

const closeBtn = ref<HTMLButtonElement | null>(null)
onMounted(() => nextTick(() => closeBtn.value?.focus()))
</script>

<template>
  <div class="overlay" @click.self="emit('close')" @keydown.esc="emit('close')">
    <section class="sheet" role="dialog" aria-modal="true" :aria-label="title">
      <button ref="closeBtn" type="button" class="close" aria-label="Close" @click="emit('close')">×</button>
      <h2 class="heading">{{ title }}</h2>
      <slot />
    </section>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: grid;
  place-items: center;
  padding: 16px;
  background: var(--overlay);
  animation: fade 160ms ease-out;
}
.sheet {
  position: relative;
  width: min(100%, 420px);
  max-height: calc(100dvh - 32px);
  overflow-y: auto;
  padding: 22px 22px 24px;
  border-radius: 22px;
  background: var(--surface);
  box-shadow: var(--shadow);
  animation: rise 220ms cubic-bezier(0.2, 0.9, 0.3, 1.2);
}
.heading {
  margin: 0 0 14px;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.35rem;
  text-align: center;
}
.close {
  position: absolute;
  top: 10px;
  right: 12px;
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 50%;
  background: transparent;
  font-size: 1.6rem;
  line-height: 1;
  cursor: pointer;
  color: var(--ink-soft);
}
.close:hover {
  background: var(--key);
}
@keyframes fade {
  from {
    opacity: 0;
  }
}
@keyframes rise {
  from {
    transform: translateY(18px) scale(0.97);
    opacity: 0;
  }
}
</style>
