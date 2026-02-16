import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 120_000,
  expect: { timeout: 30_000 },
  use: {
    baseURL: "http://localhost:3000",
    screenshot: "off", // we take manual screenshots
    trace: "on-first-retry",
  },
});
