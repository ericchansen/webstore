import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("should load successfully", async ({ page }) => {
    await page.goto("/");
    // Check for store name in title (from storeConfig)
    await expect(page).toHaveTitle(/Cocoa.*Co/i);
  });

  test("should display main content", async ({ page }) => {
    await page.goto("/");
    // Basic check that the page has content
    await expect(page.locator("body")).toBeVisible();
  });
});
