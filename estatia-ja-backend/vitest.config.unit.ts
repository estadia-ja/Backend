import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['src/**/test/*.test.js']
  },
  resolve: {
    alias: {
      auth: '/src/user/test',
    }
  }
})
