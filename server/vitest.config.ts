import { defineConfig } from "vitest/config";
import { resolve } from "path";

const testDbPath = resolve(__dirname, "prisma/test.db");

export default defineConfig({
  test: {
    globalSetup: "./src/test-setup.ts",
    env: {
      TEST_DATABASE_URL: `file:${testDbPath}`,
    },
  },
});
