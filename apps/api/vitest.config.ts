import { defineConfig } from "vitest/config";
import path from "path";
import { fileURLToPath } from "url";
import { loadEnvFile } from "process";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load the env for tests if it exists
const envPath = path.resolve(__dirname, "../../.env.test");
if (fs.existsSync(envPath)) {
  loadEnvFile(envPath);
}

export default defineConfig({
  test: {
    name: "api",
    env: {
      // set the env
      ...process.env,
    },
    testTimeout: 60000, // Increase timeout for model loading
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
