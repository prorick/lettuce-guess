import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// GitHub Pages serves this repo as a *project site* at
// https://prorick.github.io/lettuce-guess/ — next to the user site at the root
// (ADR-0003, Decision). Assets must be requested under that sub-path, or the
// page deploys and every script/style 404s. Written once, here; if the repo is
// ever renamed, this is the one line that changes.
export const PAGES_BASE = '/lettuce-guess/'

// https://vite.dev/config/
export default defineConfig({
  base: PAGES_BASE,
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
