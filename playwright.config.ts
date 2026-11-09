import { defineConfig, devices } from "@playwright/test";

const mode = process.env.TEST_SERVER_MODE === "dev" ? "dev" : "production";
const baseURL = process.env.TEST_BASE_URL || "http://127.0.0.1:3100";
export default defineConfig({
  testDir: "./tests/browser",
  timeout: 30_000,
  expect: { timeout: 8_000 },
  fullyParallel: true,
  workers: process.env.CI ? 2 : undefined,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    ...devices["Desktop Chrome"],
    baseURL,
    viewport: { width: 1440, height: 900 },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: process.env.TEST_BASE_URL ? undefined : {
    command: mode === "dev"
      ? "npm run dev -- --hostname 127.0.0.1 --port 3100"
      : "npm start -- --port 3100",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
