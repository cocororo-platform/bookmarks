import { execSync } from "child_process";
import { resolve } from "path";
import { unlinkSync, existsSync } from "fs";

const testDbPath = resolve(__dirname, "../prisma/test.db");
const testDbUrl = `file:${testDbPath}`;

export function setup() {
  execSync("npx prisma db push --skip-generate", {
    cwd: resolve(__dirname, ".."),
    env: { ...process.env, DATABASE_URL: testDbUrl },
    stdio: "ignore",
  });
}

export function teardown() {
  for (const suffix of ["", "-journal"]) {
    const path = testDbPath + suffix;
    if (existsSync(path)) unlinkSync(path);
  }
}
