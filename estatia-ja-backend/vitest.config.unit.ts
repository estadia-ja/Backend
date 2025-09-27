import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['src/**/test/*.test.ts']
  },
  resolve: {
    alias: {
      auth: '/src/user/test',
    }
  }
})
