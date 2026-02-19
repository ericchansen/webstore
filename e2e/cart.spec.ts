import { test, expect } from "@playwright/test";
import { CartPage, ProductDetailPage } from "./pages";
import { testProducts, viewports } from "./fixtures/test-data";

test.describe("Cart Page", () => {
  let cartPage: CartPage;

  test.beforeEach(async ({ page }) => {
    cartPage = new CartPage(page);
  });

  test.describe("Empty Cart", () => {
    test("should display empty cart message when no items", async () => {
      await cartPage.goto();
      await cartPage.expectCartVisible();
      await cartPage.expectEmptyCart();
    });

    test("should display continue shopping link when empty", async () => {
      await cartPage.goto();
      await expect(cartPage.continueShoppingLink).toBeVisible();
    });

    test("should navigate to products when continue shopping is clicked", async ({ page }) => {
      await cartPage.goto();
      await cartPage.continueShopping();
      await expect(page).toHaveURL(/\/products/);
    });
  });

  test.describe("Cart with Items", () => {
    test.beforeEach(async ({ page }) => {
      const productPage = new ProductDetailPage(page);
      await productPage.goto(testProducts.featured.slug);
      await productPage.addToCart();
      await cartPage.goto();
    });

    test("should display cart items", async () => {
      await cartPage.expectCartVisible();
      await cartPage.expectItemsInCart(1);
    });

    test("should display product name in cart item", async () => {
      const cartItem = cartPage.cartItems.first();
      await expect(cartItem).toContainText(testProducts.featured.name);
    });

    test("should display product price in cart item", async () => {
      const cartItem = cartPage.cartItems.first();
      await expect(cartItem).toContainText(testProducts.featured.price.replace("$", ""));
    });

    test("should display cart subtotal", async () => {
      await expect(cartPage.subtotal).toBeVisible();
      const subtotal = await cartPage.getSubtotal();
      expect(subtotal).toContain("$");
    });

    test("should display checkout button", async () => {
      await expect(cartPage.checkoutButton).toBeVisible();
      await expect(cartPage.checkoutButton).toBeEnabled();
    });
  });

  test.describe("Quantity Management", () => {
    test.beforeEach(async ({ page }) => {
      const productPage = new ProductDetailPage(page);
      await productPage.goto(testProducts.featured.slug);
      await productPage.addToCart();
      await cartPage.goto();
    });

    test("should display quantity controls for each item", async () => {
      const cartItem = cartPage.cartItems.first();
      await expect(cartItem.getByTestId("quantity-input")).toBeVisible();
      await expect(cartItem.getByTestId("quantity-increment")).toBeVisible();
      await expect(cartItem.getByTestId("quantity-decrement")).toBeVisible();
    });

    test("should increment item quantity", async () => {
      await cartPage.incrementItemQuantity(testProducts.featured.name);
      const quantity = await cartPage.getItemQuantity(testProducts.featured.name);
      expect(quantity).toBe(2);
    });

    test("should decrement item quantity", async () => {
      await cartPage.incrementItemQuantity(testProducts.featured.name);
      await cartPage.decrementItemQuantity(testProducts.featured.name);
      const quantity = await cartPage.getItemQuantity(testProducts.featured.name);
      expect(quantity).toBe(1);
    });

    test("should update quantity via input", async () => {
      await cartPage.updateItemQuantity(testProducts.featured.name, 5);
      const quantity = await cartPage.getItemQuantity(testProducts.featured.name);
      expect(quantity).toBe(5);
    });

    test("should update subtotal when quantity changes", async () => {
      const initialSubtotal = await cartPage.getSubtotal();
      await cartPage.incrementItemQuantity(testProducts.featured.name);
      const newSubtotal = await cartPage.getSubtotal();
      expect(newSubtotal).not.toBe(initialSubtotal);
    });
  });

  test.describe("Remove Items", () => {
    test.beforeEach(async ({ page }) => {
      const productPage = new ProductDetailPage(page);
      await productPage.goto(testProducts.featured.slug);
      await productPage.addToCart();
      await cartPage.goto();
    });

    test("should display remove button for each item", async () => {
      const cartItem = cartPage.cartItems.first();
      await expect(cartItem.getByTestId("remove-item")).toBeVisible();
    });

    test("should remove item when remove button is clicked", async () => {
      await cartPage.removeItem(testProducts.featured.name);
      await cartPage.expectEmptyCart();
    });

    test("should show empty cart after removing all items", async () => {
      await cartPage.removeItem(testProducts.featured.name);
      await expect(cartPage.emptyCartMessage).toBeVisible();
    });
  });

  test.describe("Multiple Items", () => {
    test("should handle multiple different products in cart", async ({ page }) => {
      const productPage = new ProductDetailPage(page);
      await productPage.goto(testProducts.featured.slug);
      await productPage.addToCart();
      await productPage.goto(testProducts.chocolateBar.slug);
      await productPage.addToCart();
      await cartPage.goto();
      await cartPage.expectItemsInCart(2);
    });

    test("should calculate subtotal for multiple items", async ({ page }) => {
      const productPage = new ProductDetailPage(page);
      await productPage.goto(testProducts.featured.slug);
      await productPage.addToCart();
      await productPage.goto(testProducts.chocolateBar.slug);
      await productPage.addToCart();
      await cartPage.goto();
      const subtotal = await cartPage.getSubtotal();
      expect(subtotal).toContain("$");
    });
  });

  test.describe("Cart Persistence", () => {
    test("should persist cart items after page reload", async ({ page }) => {
      const productPage = new ProductDetailPage(page);
      await productPage.goto(testProducts.featured.slug);
      await productPage.addToCart();
      await page.reload();
      await cartPage.goto();
      await cartPage.expectItemsInCart(1);
    });

    test("should persist cart items when navigating back to cart", async ({ page }) => {
      const productPage = new ProductDetailPage(page);
      await productPage.goto(testProducts.featured.slug);
      await productPage.addToCart();
      await cartPage.goto();
      await cartPage.expectItemsInCart(1);
      await cartPage.continueShopping();
      await cartPage.goto();
      await cartPage.expectItemsInCart(1);
    });
  });

  test.describe("Proceed to Checkout", () => {
    test.beforeEach(async ({ page }) => {
      const productPage = new ProductDetailPage(page);
      await productPage.goto(testProducts.featured.slug);
      await productPage.addToCart();
      await cartPage.goto();
    });

    test("should navigate to checkout when checkout button is clicked", async ({ page }) => {
      await cartPage.proceedToCheckout();
      await expect(page).toHaveURL(/\/checkout/);
    });

    test("should disable checkout button when cart is empty", async () => {
      await cartPage.removeItem(testProducts.featured.name);
      await expect(cartPage.checkoutButton).not.toBeVisible();
    });
  });

  test.describe("Responsive Design", () => {
    test.beforeEach(async ({ page }) => {
      const productPage = new ProductDetailPage(page);
      await productPage.goto(testProducts.featured.slug);
      await productPage.addToCart();
      await cartPage.goto();
    });

    test("should display correctly on mobile viewport", async ({ page }) => {
      await page.setViewportSize(viewports.mobile);
      await page.reload();
      await cartPage.expectCartVisible();
      await expect(cartPage.checkoutButton).toBeVisible();
    });

    test("should display correctly on tablet viewport", async ({ page }) => {
      await page.setViewportSize(viewports.tablet);
      await page.reload();
      await cartPage.expectCartVisible();
    });

    test("should display cart summary on desktop", async ({ page }) => {
      await page.setViewportSize(viewports.desktop);
      await page.reload();
      await expect(cartPage.cartSummary).toBeVisible();
    });
  });
});
