import { test, expect } from "@playwright/test";
import { 
  HomePage, 
  ProductsPage, 
  ProductDetailPage, 
} from "./pages";
import { testProducts } from "./fixtures/test-data";

/**
 * Smoke Tests - Page Rendering
 * 
 * Minimal tests to verify pages render correctly.
 * Does NOT test API-dependent features (cart, checkout, orders).
 * 
 * Run with: npx playwright test e2e/smoke.spec.ts
 * 
 * NOTE: API-dependent tests moved to smoke-full.spec.ts
 * See bead: e2e-api-tests for tracking re-enablement
 */
test.describe("Smoke Tests", () => {
  test("Homepage loads and displays key elements", async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await expect(page).toHaveTitle(/Cocoa.*Co/i);
    await homePage.expectHeaderVisible();
    await homePage.expectHeroVisible();
    await homePage.expectFeaturedProductsVisible();
    await homePage.expectFooterVisible();
  });

  test("Products page loads and displays products", async ({ page }) => {
    const productsPage = new ProductsPage(page);
    await productsPage.goto();
    await productsPage.expectProductGridVisible();
    await productsPage.expectProductsLoaded(1);
  });

  test("Product detail page loads correctly", async ({ page }) => {
    const productPage = new ProductDetailPage(page);
    await productPage.goto(testProducts.featured.slug);
    await productPage.expectProductVisible();
    await expect(productPage.addToCartButton).toBeVisible();
  });

  test("Navigation between pages works", async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.expectHeroVisible();
    
    // Navigate to products via hero CTA
    await homePage.clickHeroCta();
    const productsPage = new ProductsPage(page);
    await productsPage.expectProductGridVisible();
    
    // Navigate to product detail
    await productsPage.clickProduct(testProducts.featured.name);
    const productPage = new ProductDetailPage(page);
    await productPage.expectProductVisible();
  });
});
