import { Page, Locator, expect } from "@playwright/test";

/**
 * Base page object with common functionality
 */
export class BasePage {
  readonly page: Page;
  readonly header: Locator;
  readonly footer: Locator;
  readonly cartIcon: Locator;
  readonly cartBadge: Locator;
  readonly mobileMenuButton: Locator;
  readonly searchInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = page.getByRole("banner");
    this.footer = page.getByRole("contentinfo");
    this.cartIcon = page.getByTestId("cart-icon");
    this.cartBadge = page.getByTestId("cart-badge");
    this.mobileMenuButton = page.getByTestId("mobile-menu-button");
    this.searchInput = page.getByPlaceholder(/search/i);
  }

  async goToCart() {
    await this.cartIcon.click();
    await this.page.waitForURL(/\/cart/);
  }

  async getCartItemCount(): Promise<number> {
    const badge = this.cartBadge;
    if (await badge.isVisible()) {
      const text = await badge.textContent();
      return parseInt(text || "0", 10);
    }
    return 0;
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState("networkidle");
  }

  async expectHeaderVisible() {
    await expect(this.header).toBeVisible();
  }

  async expectFooterVisible() {
    await expect(this.footer).toBeVisible();
  }
}
