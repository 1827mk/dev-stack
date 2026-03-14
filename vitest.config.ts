import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['lib/**/*.test.ts', 'lib/**/*.spec.ts'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['lib/**/*.ts'],
      exclude: [
        'lib/**/*.test.ts',
        'lib/**/*.spec.ts',
        'lib/**/types.ts',
        'lib/test-setup.ts'
      ],
      thresholds: {
        statements: 70,
        branches: 60,
        functions: 70,
        lines: 70
      }
    },
    testTimeout: 30000,
    hookTimeout: 30000,
  },
  resolve: {
    alias: {
      '@lib': path.resolve(__dirname, 'lib')
    }
  }
});
