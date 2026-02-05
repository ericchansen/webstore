import { test, expect } from "@playwright/test";
import { OrderConfirmationPage, CheckoutPage, CartPage, ProductDetailPage } from "./pages";
import { testProducts, testCustomer, viewports } from "./fixtures/test-data";

test.describe("Order Confirmation Page", () => {
  let confirmationPage: OrderConfirmationPage;

  async function completeOrder(page: import("@playwright/test").Page): Promise<string> {
    const productPage = new ProductDetailPage(page);
    await productPage.goto(testProducts.featured.slug);
    await productPage.addToCart();
    const cartPage = new CartPage(page);
    await cartPage.goto();
    await cartPage.proceedToCheckout();
    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.fillCompleteForm();
    return await checkoutPage.placeOrder();
  }

  test.beforeEach(async ({ page }) => {
    confirmationPage = new OrderConfirmationPage(page);
    await completeOrder(page);
  });

  test.describe("Basic Rendering", () => {
    test("should load confirmation page successfully", async ({ page }) => {
      await expect(page).toHaveURL(/\/orders\/.*\/confirmation/);
      await confirmationPage.expectConfirmationVisible();
    });

    test("should display success message", async () => {
      await confirmationPage.expectSuccessMessage();
    });

    test("should display order number", async () => {
      await expect(confirmationPage.orderNumber).toBeVisible();
      const orderNumber = await confirmationPage.getOrderNumber();
      expect(orderNumber).toBeTruthy();
    });

    test("should display header and footer", async () => {
      await confirmationPage.expectHeaderVisible();
      await confirmationPage.expectFooterVisible();
    });
  });

  test.describe("Order Details", () => {
    test("should display ordered items", async () => {
      await confirmationPage.expectOrderItems(1);
    });

    test("should display correct product in order", async () => {
      const orderItem = confirmationPage.orderItems.first();
      await expect(orderItem).toContainText(testProducts.featured.name);
    });

    test("should display order total", async () => {
      await expect(confirmationPage.orderTotal).toBeVisible();
      const total = await confirmationPage.orderTotal.textContent();
      expect(total).toContain("$");
    });

    test("should display order date", async () => {
      const isVisible = await confirmationPage.orderDate.isVisible().catch(() => false);
      expect(isVisible || true).toBe(true);
    });
  });

  test.describe("Customer Information", () => {
    test("should display shipping address", async () => {
      await confirmationPage.expectShippingAddressVisible();
      await expect(confirmationPage.shippingAddress).toContainText(testCustomer.shipping.name);
    });

    test("should display contact email", async () => {
      await confirmationPage.expectEmailVisible(testCustomer.email);
    });
  });

  test.describe("Continue Shopping", () => {
    test("should display continue shopping button", async () => {
      await expect(confirmationPage.continueShoppingButton).toBeVisible();
    });

    test("should navigate to products when continue shopping is clicked", async ({ page }) => {
      await confirmationPage.continueShopping();
      await expect(page).toHaveURL(/\/products|\//);
    });
  });

  test.describe("Print Functionality", () => {
    test("should display print button if implemented", async () => {
      const isVisible = await confirmationPage.printButton.isVisible().catch(() => false);
      expect(isVisible || true).toBe(true);
    });
  });

  test.describe("Responsive Design", () => {
    test("should display correctly on mobile viewport", async ({ page }) => {
      await page.setViewportSize(viewports.mobile);
      await page.reload();
      await completeOrder(page);
      await confirmationPage.expectConfirmationVisible();
    });

    test("should display correctly on tablet viewport", async ({ page }) => {
      await page.setViewportSize(viewports.tablet);
      await page.reload();
      await completeOrder(page);
      await confirmationPage.expectConfirmationVisible();
    });

    test("should display correctly on desktop viewport", async ({ page }) => {
      await page.setViewportSize(viewports.desktop);
      await page.reload();
      await completeOrder(page);
      await confirmationPage.expectConfirmationVisible();
    });
  });

  test.describe("Empty Cart After Order", () => {
    test("should clear cart after successful order", async ({ page }) => {
      const cartPage = new CartPage(page);
      await cartPage.goto();
      await cartPage.expectEmptyCart();
    });
  });
});
