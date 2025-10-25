import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        include: ['src/**/test/*.integration.test.js'],
        setupFiles: ['./tests/setup-integration.js'],
        testTimeout: 15000,
        hookTimeout: 30000,
    },
});