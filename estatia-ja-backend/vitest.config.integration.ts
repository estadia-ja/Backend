import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        threads: false,
        include: ['src/**/test/*.integration.test.js'],
        setupFiles: ['./tests/setup-integration.js'],
        testTimeout: 15000,
    },
});