import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['src/**/test/*.unit.test.js']
  },
  resolve: {
    alias: {
      auth: '/src/**/test',
    }
  }
})
