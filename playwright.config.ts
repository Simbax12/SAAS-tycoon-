// Playwright runs the suites in testing/suites against the dev server, in Chromium.
// Next.js allows one dev server per folder, so a running `npm run dev` is reused.
import { defineConfig, devices } from "@playwright/test";
import { VIEWPORTS } from "./testing/registry/viewports";

const PORT = 3000;

export default defineConfig({
  testDir: "testing/suites",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "line" : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    // Set before the first paint, so the room skips its clips (docs/ROOM.md > Reduced motion).
    reducedMotion: "reduce",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: VIEWPORTS.desktop } },
    { name: "phone", use: { ...devices["Desktop Chrome"], viewport: VIEWPORTS.phone, hasTouch: true } },
  ],
  webServer: {
    command: "npm run dev",
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
