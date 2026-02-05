import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./base.page";

/**
 * Page object for the Order Confirmation Page
 */
export class OrderConfirmationPage extends BasePage {
  readonly pageTitle: Locator;
  readonly successMessage: Locator;
  readonly orderNumber: Locator;
  readonly orderDate: Locator;
  readonly orderItems: Locator;
  readonly orderTotal: Locator;
  readonly shippingAddress: Locator;
  readonly contactEmail: Locator;
  readonly continueShoppingButton: Locator;
  readonly printButton: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.getByRole("heading", { name: /order confirmed|thank you/i, level: 1 });
    this.successMessage = page.getByTestId("success-message");
    this.orderNumber = page.getByTestId("order-number");
    this.orderDate = page.getByTestId("order-date");
    this.orderItems = page.getByTestId("order-item");
    this.orderTotal = page.getByTestId("order-total");
    this.shippingAddress = page.getByTestId("shipping-address");
    this.contactEmail = page.getByTestId("contact-email");
    this.continueShoppingButton = page.getByRole("link", { name: /continue shopping|shop more/i });
    this.printButton = page.getByRole("button", { name: /print/i });
  }

  async goto(orderId: string) {
    await this.page.goto(`/orders/${orderId}/confirmation`);
    await this.waitForPageLoad();
  }

  async expectConfirmationVisible() {
    await expect(this.pageTitle).toBeVisible();
    await expect(this.orderNumber).toBeVisible();
  }

  async expectSuccessMessage() {
    await expect(this.successMessage).toBeVisible();
    await expect(this.successMessage).toContainText(/thank you|confirmed|received/i);
  }

  async getOrderNumber(): Promise<string> {
    return (await this.orderNumber.textContent()) || "";
  }

  async expectOrderItems(count: number) {
    await expect(this.orderItems).toHaveCount(count);
  }

  async expectShippingAddressVisible() {
    await expect(this.shippingAddress).toBeVisible();
  }

  async expectEmailVisible(email: string) {
    await expect(this.contactEmail).toContainText(email);
  }

  async continueShopping() {
    await this.continueShoppingButton.click();
    await this.page.waitForURL(/\/products|\//);
  }
}
