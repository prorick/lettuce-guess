<script setup lang="ts">
defineProps<{ message: string | null }>()
</script>

<template>
  <div class="region" aria-live="polite">
    <Transition name="toast">
      <p v-if="message" :key="message" class="toast">{{ message }}</p>
    </Transition>
  </div>
</template>

<style scoped>
.region {
  position: fixed;
  top: 76px;
  left: 0;
  right: 0;
  z-index: 30;
  display: flex;
  justify-content: center;
  pointer-events: none;
}
.toast {
  margin: 0;
  padding: 10px 18px;
  border-radius: 999px;
  background: var(--ink);
  color: var(--bg);
  font-weight: 800;
  box-shadow: var(--shadow);
}
.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
