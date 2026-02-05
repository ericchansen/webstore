import { test, expect } from "@playwright/test";
import { HomePage } from "./pages";
import { testCategories, testProducts, viewports } from "./fixtures/test-data";

test.describe("Homepage", () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test.describe("Basic Rendering", () => {
    test("should load successfully with correct title", async ({ page }) => {
      await expect(page).toHaveTitle(/Cocoa.*Co/i);
    });

    test("should display header and footer", async () => {
      await homePage.expectHeaderVisible();
      await homePage.expectFooterVisible();
    });

    test("should display cart icon in header", async () => {
      await expect(homePage.cartIcon).toBeVisible();
    });
  });

  test.describe("Hero Section", () => {
    test("should display hero section with title and CTA", async () => {
      await homePage.expectHeroVisible();
      await expect(homePage.heroTitle).toContainText(/Indulge|Chocolate|Perfection/i);
      await expect(homePage.heroCta).toBeVisible();
    });

    test("should navigate to products page when CTA is clicked", async ({ page }) => {
      await homePage.clickHeroCta();
      await expect(page).toHaveURL(/\/products/);
    });
  });

  test.describe("Categories Section", () => {
    test("should display categories section", async () => {
      await homePage.expectCategoriesVisible();
    });

    test("should display all product categories", async () => {
      const categoryCount = await homePage.getCategoryCount();
      expect(categoryCount).toBeGreaterThanOrEqual(testCategories.length);
    });

    test("should navigate to filtered products when category is clicked", async ({ page }) => {
      await homePage.clickCategory("Truffles");
      await expect(page).toHaveURL(/\/products.*category=truffles|\/products\/truffles/i);
    });
  });

  test.describe("Featured Products", () => {
    test("should display featured products section", async () => {
      await homePage.expectFeaturedProductsVisible();
    });

    test("should display at least one featured product", async () => {
      const productCount = await homePage.getFeaturedProductCount();
      expect(productCount).toBeGreaterThanOrEqual(1);
    });

    test("should navigate to product detail when featured product is clicked", async ({ page }) => {
      await homePage.clickFeaturedProduct(testProducts.featured.name);
      await expect(page).toHaveURL(new RegExp(`/products/${testProducts.featured.slug}`));
    });
  });

  test.describe("Responsive Design", () => {
    test("should display mobile menu button on mobile viewport", async ({ page }) => {
      await page.setViewportSize(viewports.mobile);
      await page.reload();
      await expect(homePage.mobileMenuButton).toBeVisible();
    });

    test("should hide mobile menu button on desktop viewport", async ({ page }) => {
      await page.setViewportSize(viewports.desktop);
      await page.reload();
      await expect(homePage.mobileMenuButton).not.toBeVisible();
    });

    test("should render correctly on tablet viewport", async ({ page }) => {
      await page.setViewportSize(viewports.tablet);
      await page.reload();
      await homePage.expectHeroVisible();
      await homePage.expectCategoriesVisible();
    });
  });
});
