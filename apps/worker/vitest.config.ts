import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadEnvFile } from 'process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load the env for tests
loadEnvFile('../../.env.test');

export default defineConfig({
  test: {
    name: 'worker',
    env: {
      // set the env
      ...process.env
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});