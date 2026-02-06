import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./base.page";

/**
 * Page object for the Product Detail Page
 */
export class ProductDetailPage extends BasePage {
  readonly productDetail: Locator;
  readonly productImage: Locator;
  readonly productGallery: Locator;
  readonly productName: Locator;
  readonly productPrice: Locator;
  readonly compareAtPrice: Locator;
  readonly productDescription: Locator;
  readonly quantityInput: Locator;
  readonly quantityIncrement: Locator;
  readonly quantityDecrement: Locator;
  readonly addToCartButton: Locator;
  readonly categoryBreadcrumb: Locator;
  readonly stockStatus: Locator;
  readonly productMetadata: Locator;
  readonly relatedProducts: Locator;

  constructor(page: Page) {
    super(page);
    // Scope selectors to the main product detail section to avoid related products
    this.productDetail = page.getByTestId("product-detail");
    this.productImage = page.getByTestId("product-image");
    this.productGallery = page.getByTestId("product-gallery");
    this.productName = page.getByTestId("detail-product-name");
    this.productPrice = page.getByTestId("detail-product-price");
    this.compareAtPrice = page.getByTestId("compare-at-price");
    this.productDescription = page.getByTestId("product-description");
    this.quantityInput = page.getByTestId("quantity-input");
    this.quantityIncrement = page.getByTestId("quantity-increment");
    this.quantityDecrement = page.getByTestId("quantity-decrement");
    this.addToCartButton = page.getByTestId("add-to-cart");
    this.categoryBreadcrumb = page.getByTestId("category-breadcrumb");
    this.stockStatus = page.getByTestId("stock-status");
    this.productMetadata = page.getByTestId("product-metadata");
    this.relatedProducts = page.getByTestId("related-products");
  }

  async goto(slug: string) {
    await this.page.goto(`/products/${slug}`);
    await this.waitForPageLoad();
  }

  async expectProductVisible() {
    await expect(this.productName).toBeVisible();
    await expect(this.productPrice).toBeVisible();
    await expect(this.productImage).toBeVisible();
  }

  async getProductName(): Promise<string> {
    return (await this.productName.textContent()) || "";
  }

  async getProductPrice(): Promise<string> {
    return (await this.productPrice.textContent()) || "";
  }

  async setQuantity(quantity: number) {
    await this.quantityInput.fill(quantity.toString());
  }

  async incrementQuantity() {
    await this.quantityIncrement.click();
  }

  async decrementQuantity() {
    await this.quantityDecrement.click();
  }

  async addToCart() {
    const initialCount = await this.getCartItemCount();
    await this.addToCartButton.click();
    await expect(async () => {
      const newCount = await this.getCartItemCount();
      expect(newCount).toBeGreaterThan(initialCount);
    }).toPass({ timeout: 5000 });
  }

  async addToCartWithQuantity(quantity: number) {
    await this.setQuantity(quantity);
    await this.addToCart();
  }

  async expectInStock() {
    await expect(this.stockStatus).toContainText(/in stock/i);
  }

  async expectOutOfStock() {
    await expect(this.stockStatus).toContainText(/out of stock/i);
    await expect(this.addToCartButton).toBeDisabled();
  }
}
