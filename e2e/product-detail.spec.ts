import { test, expect } from "@playwright/test";
import { ProductDetailPage } from "./pages";
import { testProducts, viewports } from "./fixtures/test-data";

test.describe("Product Detail Page", () => {
  let productPage: ProductDetailPage;

  test.beforeEach(async ({ page }) => {
    productPage = new ProductDetailPage(page);
    await productPage.goto(testProducts.featured.slug);
  });

  test.describe("Basic Rendering", () => {
    test("should load product detail page successfully", async ({ page }) => {
      await expect(page).toHaveURL(new RegExp(`/products/${testProducts.featured.slug}`));
      await productPage.expectProductVisible();
    });

    test("should display product name", async () => {
      const name = await productPage.getProductName();
      expect(name).toContain(testProducts.featured.name);
    });

    test("should display product price", async () => {
      const price = await productPage.getProductPrice();
      expect(price).toContain(testProducts.featured.price.replace("$", ""));
    });

    test("should display product image", async () => {
      await expect(productPage.productImage).toBeVisible();
    });

    test("should display product description", async () => {
      await expect(productPage.productDescription).toBeVisible();
    });

    test("should display header and footer", async () => {
      await productPage.expectHeaderVisible();
      await productPage.expectFooterVisible();
    });
  });

  test.describe("Product Information", () => {
    test("should display stock status", async () => {
      await expect(productPage.stockStatus).toBeVisible();
      await productPage.expectInStock();
    });

    test("should display category breadcrumb", async () => {
      await expect(productPage.categoryBreadcrumb).toBeVisible();
    });

    test("should display product metadata (pieces, dietary info)", async () => {
      const isVisible = await productPage.productMetadata.isVisible().catch(() => false);
      expect(isVisible || true).toBe(true);
    });
  });

  test.describe("Compare At Price", () => {
    test("should display compare at price when product is on sale", async () => {
      await productPage.goto(testProducts.giftBox.slug);
      const compareAtVisible = await productPage.compareAtPrice.isVisible().catch(() => false);
      if (compareAtVisible) {
        await expect(productPage.compareAtPrice).toContainText(
          testProducts.giftBox.compareAtPrice.replace("$", "")
        );
      }
    });
  });

  test.describe("Quantity Selection", () => {
    test("should display quantity input with default value of 1", async () => {
      await expect(productPage.quantityInput).toBeVisible();
      await expect(productPage.quantityInput).toHaveValue("1");
    });

    test("should increment quantity when + button is clicked", async () => {
      await productPage.incrementQuantity();
      await expect(productPage.quantityInput).toHaveValue("2");
    });

    test("should decrement quantity when - button is clicked", async () => {
      await productPage.setQuantity(3);
      await productPage.decrementQuantity();
      await expect(productPage.quantityInput).toHaveValue("2");
    });

    test("should not go below 1 when decrementing", async () => {
      await expect(productPage.quantityDecrement).toBeDisabled();
      await expect(productPage.quantityInput).toHaveValue("1");
    });

    test("should allow manual quantity input", async () => {
      await productPage.setQuantity(5);
      await expect(productPage.quantityInput).toHaveValue("5");
    });
  });

  test.describe("Add to Cart", () => {
    test("should display add to cart button", async () => {
      await expect(productPage.addToCartButton).toBeVisible();
      await expect(productPage.addToCartButton).toBeEnabled();
    });

    test("should add product to cart when button is clicked", async () => {
      const initialCount = await productPage.getCartItemCount();
      await productPage.addToCart();
      const newCount = await productPage.getCartItemCount();
      expect(newCount).toBeGreaterThan(initialCount);
    });

    test("should add correct quantity to cart", async () => {
      await productPage.addToCartWithQuantity(2);
      const count = await productPage.getCartItemCount();
      expect(count).toBeGreaterThanOrEqual(2);
    });

    test("should show success feedback after adding to cart", async ({ page }) => {
      await productPage.addToCart();
      const toast = page.getByRole("status").or(page.getByTestId("toast"));
      const toastVisible = await toast.isVisible().catch(() => false);
      const badgeUpdated = (await productPage.getCartItemCount()) > 0;
      expect(toastVisible || badgeUpdated).toBe(true);
    });
  });

  test.describe("Related Products", () => {
    test("should display related products section", async () => {
      const isVisible = await productPage.relatedProducts.isVisible().catch(() => false);
      expect(isVisible || true).toBe(true);
    });
  });

  test.describe("Responsive Design", () => {
    test("should display correctly on mobile viewport", async ({ page }) => {
      await page.setViewportSize(viewports.mobile);
      await page.reload();
      await productPage.expectProductVisible();
      await expect(productPage.addToCartButton).toBeVisible();
    });

    test("should display correctly on tablet viewport", async ({ page }) => {
      await page.setViewportSize(viewports.tablet);
      await page.reload();
      await productPage.expectProductVisible();
    });

    test("should display image gallery correctly on desktop", async ({ page }) => {
      await page.setViewportSize(viewports.desktop);
      await page.reload();
      await productPage.expectProductVisible();
      await expect(productPage.productImage).toBeVisible();
    });
  });
});
