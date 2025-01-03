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
        'src/index.ts',
        'src/docs.ts',
        'src/features/account/index.ts',
        'src/features/auth/index.ts',
        'src/features/integration/index.ts',
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
