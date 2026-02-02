import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      exclude: [
        'node_modules/',
        'dist/',
        'storybook-static/',
        '**/*.stories.tsx',
        '**/*.test.tsx',
        'vitest.config.ts',
        'vitest.setup.ts',
        '.storybook/',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
