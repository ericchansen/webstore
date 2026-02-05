import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./base.page";

/**
 * Page object for the Cart Page
 */
export class CartPage extends BasePage {
  readonly pageTitle: Locator;
  readonly cartItems: Locator;
  readonly emptyCartMessage: Locator;
  readonly continueShoppingLink: Locator;
  readonly subtotal: Locator;
  readonly checkoutButton: Locator;
  readonly cartSummary: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.getByRole("heading", { name: /cart/i, level: 1 });
    this.cartItems = page.getByTestId("cart-item");
    this.emptyCartMessage = page.getByTestId("empty-cart-message");
    this.continueShoppingLink = page.getByRole("link", { name: /continue shopping/i });
    this.subtotal = page.getByTestId("cart-subtotal");
    this.checkoutButton = page.getByTestId("checkout-button");
    this.cartSummary = page.getByTestId("cart-summary");
  }

  async goto() {
    await this.page.goto("/cart");
    await this.waitForPageLoad();
  }

  async expectCartVisible() {
    await expect(this.pageTitle).toBeVisible();
  }

  async expectEmptyCart() {
    await expect(this.emptyCartMessage).toBeVisible();
    await expect(this.cartItems).toHaveCount(0);
  }

  async expectItemsInCart(count: number) {
    await expect(this.cartItems).toHaveCount(count);
  }

  async getCartItemCount(): Promise<number> {
    return await this.cartItems.count();
  }

  async getItemQuantity(productName: string): Promise<number> {
    const item = this.cartItems.filter({ hasText: productName });
    const quantityInput = item.getByTestId("quantity-input");
    const value = await quantityInput.inputValue();
    return parseInt(value, 10);
  }

  async updateItemQuantity(productName: string, quantity: number) {
    const item = this.cartItems.filter({ hasText: productName });
    const quantityInput = item.getByTestId("quantity-input");
    await quantityInput.fill(quantity.toString());
    await quantityInput.blur();
    await this.waitForCartUpdate();
  }

  async incrementItemQuantity(productName: string) {
    const item = this.cartItems.filter({ hasText: productName });
    await item.getByTestId("quantity-increment").click();
    await this.waitForCartUpdate();
  }

  async decrementItemQuantity(productName: string) {
    const item = this.cartItems.filter({ hasText: productName });
    await item.getByTestId("quantity-decrement").click();
    await this.waitForCartUpdate();
  }

  async removeItem(productName: string) {
    const initialCount = await this.getCartItemCount();
    const item = this.cartItems.filter({ hasText: productName });
    await item.getByTestId("remove-item").click();
    await expect(async () => {
      const newCount = await this.getCartItemCount();
      expect(newCount).toBe(initialCount - 1);
    }).toPass({ timeout: 5000 });
  }

  async getSubtotal(): Promise<string> {
    return (await this.subtotal.textContent()) || "";
  }

  async proceedToCheckout() {
    await this.checkoutButton.click();
    await this.page.waitForURL(/\/checkout/);
  }

  async continueShopping() {
    await this.continueShoppingLink.click();
    await this.page.waitForURL(/\/products/);
  }

  private async waitForCartUpdate() {
    await this.page.waitForResponse(
      (response) => response.url().includes("/api/cart") && response.status() === 200
    ).catch(() => {});
    await this.page.waitForTimeout(300);
  }
}
