import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./base.page";

/**
 * Page object for the Product Listing Page
 */
export class ProductsPage extends BasePage {
  readonly pageTitle: Locator;
  readonly productGrid: Locator;
  readonly productCards: Locator;
  readonly filtersPanel: Locator;
  readonly categoryFilter: Locator;
  readonly priceFilter: Locator;
  readonly sortDropdown: Locator;
  readonly pagination: Locator;
  readonly paginationNext: Locator;
  readonly paginationPrev: Locator;
  readonly loadingSpinner: Locator;
  readonly noResultsMessage: Locator;
  readonly resultCount: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.getByRole("heading", { level: 1 });
    this.productGrid = page.getByTestId("product-grid").first();
    this.productCards = page.getByTestId("product-card");
    this.filtersPanel = page.getByTestId("filters-panel");
    this.categoryFilter = page.getByTestId("category-filter");
    this.priceFilter = page.getByTestId("price-filter");
    this.sortDropdown = page.getByTestId("sort-dropdown");
    this.pagination = page.getByTestId("pagination");
    this.paginationNext = page.getByTestId("pagination-next");
    this.paginationPrev = page.getByTestId("pagination-prev");
    this.loadingSpinner = page.getByTestId("loading-spinner");
    this.noResultsMessage = page.getByTestId("no-results");
    this.resultCount = page.getByTestId("result-count");
  }

  async goto(category?: string) {
    const url = category ? `/products?category=${category}` : "/products";
    await this.page.goto(url);
    await this.waitForPageLoad();
  }

  async expectProductGridVisible() {
    await expect(this.productGrid).toBeVisible();
  }

  async getProductCount(): Promise<number> {
    return await this.productCards.count();
  }

  async expectProductsLoaded(minCount = 1) {
    await expect(this.productCards.first()).toBeVisible();
    expect(await this.getProductCount()).toBeGreaterThanOrEqual(minCount);
  }

  async filterByCategory(category: string) {
    await this.categoryFilter.getByRole("link", { name: category }).click();
    await this.waitForPageLoad();
    await expect(this.productCards.first()).toBeVisible();
  }

  async sortBy(option: "price-asc" | "price-desc" | "newest" | "popular") {
    await this.sortDropdown.click();
    await this.page.getByRole("option", { name: new RegExp(option, "i") }).click();
    await this.waitForProductsUpdate();
  }

  async goToNextPage() {
    await this.paginationNext.click();
    await this.waitForProductsUpdate();
  }

  async goToPreviousPage() {
    await this.paginationPrev.click();
    await this.waitForProductsUpdate();
  }

  async clickProduct(productName: string) {
    await this.productCards.filter({ hasText: productName }).click();
    await this.page.waitForURL(/\/products\//);
  }

  async waitForProductsUpdate() {
    try {
      await this.loadingSpinner.waitFor({ state: "visible", timeout: 500 });
      await this.loadingSpinner.waitFor({ state: "hidden", timeout: 10000 });
    } catch {
      // No loading spinner shown
    }
  }

  async getProductNames(): Promise<string[]> {
    await expect(this.productCards.first()).toBeVisible();
    const names = await this.productCards.locator('[data-testid="product-name"]').allTextContents();
    return names.filter(n => n.length > 0);
  }
}
