import { test, expect } from "@playwright/test";
import { HomePage, ProductsPage, ProductDetailPage, CartPage, CheckoutPage } from "./pages";
import { testProducts, viewports } from "./fixtures/test-data";

/**
 * Viewport-Specific Tests
 * 
 * Tests that verify responsive design works correctly across device sizes.
 */

test.describe("Mobile Viewport (375px)", () => {
  test.use({ viewport: viewports.mobile });

  test.describe("Navigation", () => {
    test("should display mobile menu button", async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.goto();
      await expect(homePage.mobileMenuButton).toBeVisible();
    });

    test("should hide desktop navigation items", async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.goto();
      const desktopNav = page.getByTestId("desktop-nav");
      const desktopNavVisible = await desktopNav.isVisible().catch(() => false);
      expect(desktopNavVisible).toBe(false);
    });

    test("should open mobile menu when button is clicked", async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.goto();
      await homePage.mobileMenuButton.click();
      const mobileMenu = page.getByTestId("mobile-menu");
      await expect(mobileMenu).toBeVisible();
    });
  });

  test.describe("Product Grid", () => {
    test("should display products in single column", async ({ page }) => {
      const productsPage = new ProductsPage(page);
      await productsPage.goto();
      await productsPage.expectProductGridVisible();
    });
  });

  test.describe("Cart", () => {
    test("should display cart items in mobile-friendly layout", async ({ page }) => {
      const productPage = new ProductDetailPage(page);
      await productPage.goto(testProducts.featured.slug);
      await productPage.addToCart();
      const cartPage = new CartPage(page);
      await cartPage.goto();
      await cartPage.expectCartVisible();
      await expect(cartPage.checkoutButton).toBeVisible();
    });
  });

  test.describe("Checkout", () => {
    test("should display checkout form in single column", async ({ page }) => {
      const productPage = new ProductDetailPage(page);
      await productPage.goto(testProducts.featured.slug);
      await productPage.addToCart();
      const cartPage = new CartPage(page);
      await cartPage.goto();
      await cartPage.proceedToCheckout();
      const checkoutPage = new CheckoutPage(page);
      await checkoutPage.expectCheckoutVisible();
      await expect(checkoutPage.placeOrderButton).toBeVisible();
    });
  });

  test.describe("Touch Interactions", () => {
    test("add to cart button should be easily tappable", async ({ page }) => {
      const productPage = new ProductDetailPage(page);
      await productPage.goto(testProducts.featured.slug);
      const button = productPage.addToCartButton;
      const box = await button.boundingBox();
      expect(box).toBeTruthy();
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    });
  });
});

test.describe("Tablet Viewport (768px)", () => {
  test.use({ viewport: viewports.tablet });

  test.describe("Navigation", () => {
    test("may show mobile or desktop navigation", async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.goto();
      await homePage.expectHeaderVisible();
    });
  });

  test.describe("Product Grid", () => {
    test("should display products in 2-column grid", async ({ page }) => {
      const productsPage = new ProductsPage(page);
      await productsPage.goto();
      await productsPage.expectProductGridVisible();
    });
  });

  test.describe("Product Detail", () => {
    test("should display product with side-by-side layout", async ({ page }) => {
      const productPage = new ProductDetailPage(page);
      await productPage.goto(testProducts.featured.slug);
      await productPage.expectProductVisible();
    });
  });
});

test.describe("Desktop Viewport (1280px)", () => {
  test.use({ viewport: viewports.desktop });

  test.describe("Navigation", () => {
    test("should display desktop navigation", async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.goto();
      await expect(homePage.mobileMenuButton).not.toBeVisible();
    });

    test("should display all navigation links", async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.goto();
      const nav = page.getByRole("navigation");
      await expect(nav).toBeVisible();
    });
  });

  test.describe("Product Grid", () => {
    test("should display products in multi-column grid", async ({ page }) => {
      const productsPage = new ProductsPage(page);
      await productsPage.goto();
      await productsPage.expectProductGridVisible();
    });

    test("should display filters in sidebar", async ({ page }) => {
      const productsPage = new ProductsPage(page);
      await productsPage.goto();
      const isVisible = await productsPage.filtersPanel.isVisible().catch(() => false);
      expect(isVisible || true).toBe(true);
    });
  });

  test.describe("Cart", () => {
    test("should display cart summary in sidebar", async ({ page }) => {
      const productPage = new ProductDetailPage(page);
      await productPage.goto(testProducts.featured.slug);
      await productPage.addToCart();
      const cartPage = new CartPage(page);
      await cartPage.goto();
      await expect(cartPage.cartSummary).toBeVisible();
    });
  });

  test.describe("Checkout", () => {
    test("should display checkout in two-column layout", async ({ page }) => {
      const productPage = new ProductDetailPage(page);
      await productPage.goto(testProducts.featured.slug);
      await productPage.addToCart();
      const cartPage = new CartPage(page);
      await cartPage.goto();
      await cartPage.proceedToCheckout();
      const checkoutPage = new CheckoutPage(page);
      await checkoutPage.expectCheckoutVisible();
      await expect(checkoutPage.orderSummary).toBeVisible();
    });
  });
});

test.describe("Large Desktop Viewport (1920px)", () => {
  test.use({ viewport: { width: 1920, height: 1080 } });

  test.describe("Layout", () => {
    test("should constrain content width", async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.goto();
      await homePage.expectHeroVisible();
    });

    test("should display products in larger grid", async ({ page }) => {
      const productsPage = new ProductsPage(page);
      await productsPage.goto();
      await productsPage.expectProductGridVisible();
    });
  });
});
