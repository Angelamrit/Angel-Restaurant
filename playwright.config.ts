import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/browser", timeout: 240000, workers: 1, retries: 0,
  // Dynamic admin routes compile on first visit in the isolated dev server.
  expect: { timeout: 15000 },
  use: { baseURL: "http://127.0.0.1:3100", channel: "msedge", trace: "retain-on-failure", actionTimeout: 15000, navigationTimeout: 60000, viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce" },
  webServer: { command: "node scripts/test-server.mts", url: "http://127.0.0.1:3100/admin", reuseExistingServer: false, timeout: 120000 },
});
