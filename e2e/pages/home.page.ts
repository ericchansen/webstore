import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./base.page";

/**
 * Page object for the Homepage
 */
export class HomePage extends BasePage {
  readonly heroSection: Locator;
  readonly heroTitle: Locator;
  readonly heroSubtitle: Locator;
  readonly heroCta: Locator;
  readonly categoriesSection: Locator;
  readonly categoryCards: Locator;
  readonly featuredSection: Locator;
  readonly featuredProducts: Locator;
  readonly featuresSection: Locator;
  readonly featureCards: Locator;

  constructor(page: Page) {
    super(page);
    this.heroSection = page.getByTestId("hero-section").first();
    this.heroTitle = page.getByTestId("hero-title").first();
    this.heroSubtitle = page.getByTestId("hero-subtitle");
    this.heroCta = page.getByTestId("hero-cta");
    this.categoriesSection = page.getByTestId("categories-section");
    this.categoryCards = page.getByTestId("category-card");
    this.featuredSection = page.getByTestId("featured-section");
    this.featuredProducts = page.getByTestId("product-card");
    this.featuresSection = page.getByTestId("features-section");
    this.featureCards = page.getByTestId("feature-card");
  }

  async goto() {
    await this.page.goto("/");
    await this.waitForPageLoad();
  }

  async expectHeroVisible() {
    await expect(this.heroSection).toBeVisible();
    await expect(this.heroTitle).toBeVisible();
  }

  async expectCategoriesVisible() {
    await expect(this.categoriesSection).toBeVisible();
  }

  async getCategoryCount(): Promise<number> {
    return await this.categoryCards.count();
  }

  async expectFeaturedProductsVisible() {
    await expect(this.featuredSection).toBeVisible();
  }

  async getFeaturedProductCount(): Promise<number> {
    return await this.featuredProducts.count();
  }

  async clickHeroCta() {
    await this.heroCta.click();
    await this.page.waitForURL(/\/products/);
  }

  async clickCategory(categoryName: string) {
    await this.categoryCards.filter({ hasText: categoryName }).click();
    await this.page.waitForURL(/\/products/);
  }

  async clickFeaturedProduct(productName: string) {
    const card = this.featuredProducts.filter({ hasText: productName });
    await card.getByTestId("product-name").click();
    await this.page.waitForURL(/\/products\//);
  }
}
