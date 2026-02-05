import { test, expect } from "@playwright/test";
import { 
  HomePage, 
  ProductsPage, 
  ProductDetailPage, 
  CartPage, 
  CheckoutPage, 
  OrderConfirmationPage 
} from "./pages";
import { testProducts, testCustomer } from "./fixtures/test-data";

/**
 * Smoke Tests
 * 
 * A subset of critical user flows for quick post-deploy validation.
 * Run with: npx playwright test e2e/smoke.spec.ts
 */
test.describe("Smoke Tests", () => {
  test.describe.configure({ mode: "serial" });

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

  test("Add to cart works", async ({ page }) => {
    const productPage = new ProductDetailPage(page);
    await productPage.goto(testProducts.featured.slug);
    const initialCount = await productPage.getCartItemCount();
    await productPage.addToCart();
    const newCount = await productPage.getCartItemCount();
    expect(newCount).toBeGreaterThan(initialCount);
  });

  test("Cart page displays items correctly", async ({ page }) => {
    const productPage = new ProductDetailPage(page);
    await productPage.goto(testProducts.featured.slug);
    await productPage.addToCart();
    const cartPage = new CartPage(page);
    await cartPage.goto();
    await cartPage.expectCartVisible();
    await cartPage.expectItemsInCart(1);
    await expect(cartPage.checkoutButton).toBeEnabled();
  });

  test("Checkout form accepts valid input", async ({ page }) => {
    const productPage = new ProductDetailPage(page);
    await productPage.goto(testProducts.featured.slug);
    await productPage.addToCart();
    const cartPage = new CartPage(page);
    await cartPage.goto();
    await cartPage.proceedToCheckout();
    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.expectCheckoutVisible();
    await checkoutPage.fillCompleteForm();
    await expect(checkoutPage.emailInput).toHaveValue(testCustomer.email);
    await expect(checkoutPage.shippingNameInput).toHaveValue(testCustomer.shipping.name);
  });

  test("Complete order flow works end-to-end", async ({ page }) => {
    const productPage = new ProductDetailPage(page);
    await productPage.goto(testProducts.featured.slug);
    await productPage.addToCart();
    const cartPage = new CartPage(page);
    await cartPage.goto();
    await cartPage.expectItemsInCart(1);
    await cartPage.proceedToCheckout();
    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.fillCompleteForm();
    const orderId = await checkoutPage.placeOrder();
    const confirmationPage = new OrderConfirmationPage(page);
    await confirmationPage.expectConfirmationVisible();
    await confirmationPage.expectSuccessMessage();
    expect(orderId).toBeTruthy();
  });
});

/**
 * Critical Path Tests
 */
test.describe("Critical Path - Happy Path Order Flow", () => {
  test("User can browse, add to cart, and complete checkout", async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.expectHeroVisible();
    await homePage.clickHeroCta();
    const productsPage = new ProductsPage(page);
    await productsPage.expectProductGridVisible();
    await productsPage.clickProduct(testProducts.featured.name);
    const productPage = new ProductDetailPage(page);
    await productPage.expectProductVisible();
    await productPage.addToCartWithQuantity(2);
    const cartPage = new CartPage(page);
    await cartPage.goToCart();
    await cartPage.expectItemsInCart(1);
    await cartPage.proceedToCheckout();
    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.fillCompleteForm();
    await checkoutPage.placeOrder();
    const confirmationPage = new OrderConfirmationPage(page);
    await confirmationPage.expectConfirmationVisible();
    await confirmationPage.expectSuccessMessage();
  });
});

/**
 * API Health Checks
 */
test.describe("API Health Checks", () => {
  test("Products API responds", async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}/api/products`);
    expect(response.ok()).toBe(true);
  });

  test("Categories API responds", async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}/api/categories`);
    expect(response.ok()).toBe(true);
  });

  test("Cart API responds", async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}/api/cart`);
    expect([200, 404].includes(response.status())).toBe(true);
  });
});
