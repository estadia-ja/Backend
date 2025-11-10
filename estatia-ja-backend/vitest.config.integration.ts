import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        include: ['src/**/test/*.integration.test.js'],
        setupFiles: ['./tests/setup-integration.js'],
        testTimeout: 30000,
        hookTimeout: 60000,
    },
});