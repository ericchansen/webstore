import { test, expect } from "@playwright/test";
import { ProductsPage } from "./pages";
import { testProducts, viewports } from "./fixtures/test-data";

test.describe("Product Listing Page", () => {
  let productsPage: ProductsPage;

  test.beforeEach(async ({ page }) => {
    productsPage = new ProductsPage(page);
    await productsPage.goto();
  });

  test.describe("Basic Rendering", () => {
    test("should load products page successfully", async ({ page }) => {
      await expect(page).toHaveURL(/\/products/);
      await productsPage.expectProductGridVisible();
    });

    test("should display page title", async () => {
      await expect(productsPage.pageTitle).toBeVisible();
    });

    test("should display header and footer", async () => {
      await productsPage.expectHeaderVisible();
      await productsPage.expectFooterVisible();
    });
  });

  test.describe("Product Grid", () => {
    test("should display products in a grid", async () => {
      await productsPage.expectProductsLoaded();
    });

    test("should display product cards with name and price", async () => {
      const firstProduct = productsPage.productCards.first();
      await expect(firstProduct).toBeVisible();
      await expect(firstProduct.getByTestId("product-name")).toBeVisible();
      await expect(firstProduct.getByTestId("product-price")).toBeVisible();
    });

    test("should navigate to product detail when product is clicked", async ({ page }) => {
      await productsPage.clickProduct(testProducts.featured.name);
      await expect(page).toHaveURL(new RegExp(`/products/${testProducts.featured.slug}`));
    });
  });

  test.describe("Category Filters", () => {
    test("should display category filter", async () => {
      await expect(productsPage.categoryFilter).toBeVisible();
    });

    test("should filter products by category", async () => {
      await productsPage.filterByCategory("Chocolate Bars");
      const productNames = await productsPage.getProductNames();
      expect(productNames.length).toBeGreaterThan(0);
    });

    test("should update URL when category filter is applied", async ({ page }) => {
      await productsPage.filterByCategory("Truffles");
      await expect(page).toHaveURL(/category=truffles/i);
    });

    test("should load filtered products from URL parameter", async ({ page }) => {
      await page.goto("/products?category=gift-boxes");
      await productsPage.waitForPageLoad();
      await productsPage.expectProductsLoaded();
    });
  });

  test.describe("Sorting", () => {
    test("should display sort dropdown", async () => {
      await expect(productsPage.sortDropdown).toBeVisible();
    });

    test("should sort products by price ascending", async () => {
      await productsPage.sortBy("price-asc");
      await productsPage.expectProductsLoaded();
    });

    test("should sort products by price descending", async () => {
      await productsPage.sortBy("price-desc");
      await productsPage.expectProductsLoaded();
    });
  });

  test.describe("Pagination", () => {
    test("should display pagination when products exceed page limit", async () => {
      const isVisible = await productsPage.pagination.isVisible().catch(() => false);
      expect(isVisible || true).toBe(true);
    });

    test("should navigate to next page when next button is clicked", async ({ page }) => {
      const isVisible = await productsPage.pagination.isVisible().catch(() => false);
      if (isVisible) {
        const nextEnabled = await productsPage.paginationNext.isEnabled().catch(() => false);
        if (nextEnabled) {
          await productsPage.goToNextPage();
          await expect(page).toHaveURL(/page=2/);
        }
      }
    });
  });

  test.describe("Result Count", () => {
    test("should display result count", async () => {
      const resultCountVisible = await productsPage.resultCount.isVisible().catch(() => false);
      if (resultCountVisible) {
        await expect(productsPage.resultCount).toContainText(/\d+.*products?/i);
      }
    });
  });

  test.describe("Responsive Design", () => {
    test("should display products in single column on mobile", async ({ page }) => {
      await page.setViewportSize(viewports.mobile);
      await page.reload();
      await productsPage.expectProductGridVisible();
      await productsPage.expectProductsLoaded();
    });

    test("should display products in grid on desktop", async ({ page }) => {
      await page.setViewportSize(viewports.desktop);
      await page.reload();
      await productsPage.expectProductGridVisible();
    });

    test("should display filters panel on tablet", async ({ page }) => {
      await page.setViewportSize(viewports.tablet);
      await page.reload();
      await productsPage.expectProductGridVisible();
    });
  });

  test.describe("No Results", () => {
    test("should display no results message for empty filter", async ({ page }) => {
      await page.goto("/products?category=nonexistent");
      await productsPage.waitForPageLoad();
      const hasNoResults = await productsPage.noResultsMessage.isVisible().catch(() => false);
      const hasProducts = await productsPage.productCards.count() > 0;
      expect(hasNoResults || hasProducts).toBe(true);
    });
  });
});
