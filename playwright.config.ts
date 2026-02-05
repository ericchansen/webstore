import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration for webstore E2E tests.
 * Supports dual-target testing: local (localhost) and deployed (Azure URL).
 * Set BASE_URL environment variable to test against deployed environments.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "html",
  
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    // Desktop browsers
    {
      name: "Desktop Edge",
      use: { ...devices["Desktop Edge"], channel: "msedge" },
    },
    {
      name: "Desktop Chrome",
      use: { ...devices["Desktop Chrome"] },
    },
    
    // Mobile viewports
    {
      name: "iPhone SE",
      use: { ...devices["iPhone SE"] },
    },
    {
      name: "iPhone 14",
      use: { viewport: { width: 390, height: 844 }, isMobile: true },
    },
    {
      name: "Android",
      use: { viewport: { width: 360, height: 800 }, isMobile: true },
    },
    
    // Tablet viewports
    {
      name: "iPad",
      use: { ...devices["iPad (gen 7)"] },
    },
    {
      name: "iPad Pro",
      use: { viewport: { width: 1024, height: 1366 }, isMobile: false },
    },
    
    // Large desktop
    {
      name: "Desktop 1920",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1920, height: 1080 } },
    },
  ],

  // Run local dev server before tests when testing locally
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: "npm run dev",
        url: "http://localhost:3000",
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
      },
});
