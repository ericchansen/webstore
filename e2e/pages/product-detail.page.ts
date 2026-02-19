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
    // Scope selectors to the main product detail section to avoid hydration duplicates
    this.productDetail = page.getByTestId("product-detail").first();
    this.productImage = this.productDetail.getByTestId("product-image");
    this.productGallery = this.productDetail.getByTestId("product-gallery");
    this.productName = this.productDetail.getByTestId("detail-product-name");
    this.productPrice = this.productDetail.getByTestId("detail-product-price");
    this.compareAtPrice = this.productDetail.getByTestId("compare-at-price");
    this.productDescription = this.productDetail.getByTestId("product-description");
    this.quantityInput = this.productDetail.getByTestId("quantity-input");
    this.quantityIncrement = this.productDetail.getByTestId("quantity-increment");
    this.quantityDecrement = this.productDetail.getByTestId("quantity-decrement");
    this.addToCartButton = this.productDetail.getByTestId("add-to-cart");
    this.categoryBreadcrumb = page.getByTestId("category-breadcrumb").first();
    this.stockStatus = this.productDetail.getByTestId("stock-status");
    this.productMetadata = this.productDetail.getByTestId("product-metadata");
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
