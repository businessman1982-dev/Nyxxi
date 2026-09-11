import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const entry = (p) => new URL(p, import.meta.url).pathname

// Two pages: the scroll-film landing at "/", the Nyxxi app at "/app/".
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        landing: entry('index.html'),
        app: entry('app/index.html'),
      },
    },
  },
})
