import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// On GitHub Pages the app lives under /SwipeSort/; locally it stays at the root.
export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/SwipeSort/' : '/',
  plugins: [react()],
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
})
