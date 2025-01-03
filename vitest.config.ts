/// <reference types="vitest" />

import path from 'node:path';

import { defaultExclude, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      reporter: ['text', 'html'],
      include: ['src/**/*.ts'],
      exclude: [
        '**/*.d.ts',
        '**/*.test.ts',
        '**/types/**/*',
        '**/schema/**/*',
        '**/domain/**/*',
        '**/containers/**/*',
        '**/constants/**/*',
        ...defaultExclude,
      ],
    },
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
