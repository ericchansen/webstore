import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./base.page";
import { testCustomer } from "../fixtures/test-data";

/**
 * Page object for the Checkout Page
 */
export class CheckoutPage extends BasePage {
  readonly pageTitle: Locator;
  readonly orderSummary: Locator;
  readonly orderItems: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly shippingNameInput: Locator;
  readonly shippingAddressInput: Locator;
  readonly shippingCityInput: Locator;
  readonly shippingStateInput: Locator;
  readonly shippingZipInput: Locator;
  readonly shippingCountrySelect: Locator;
  readonly sameAsShippingCheckbox: Locator;
  readonly subtotal: Locator;
  readonly shippingCost: Locator;
  readonly tax: Locator;
  readonly total: Locator;
  readonly placeOrderButton: Locator;
  readonly backToCartLink: Locator;
  readonly errorMessages: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.getByRole("heading", { name: /checkout/i, level: 1 });
    this.orderSummary = page.getByTestId("order-summary");
    this.orderItems = page.getByTestId("order-item");
    this.emailInput = page.getByLabel(/email/i);
    this.phoneInput = page.getByLabel(/phone/i);
    this.shippingNameInput = page.getByLabel(/full name|name/i).first();
    this.shippingAddressInput = page.getByLabel(/address|street/i).first();
    this.shippingCityInput = page.getByLabel(/city/i);
    this.shippingStateInput = page.getByLabel(/state|province/i);
    this.shippingZipInput = page.getByLabel(/zip|postal/i);
    this.shippingCountrySelect = page.getByLabel(/country/i);
    this.sameAsShippingCheckbox = page.getByLabel(/same as shipping|billing same/i);
    this.subtotal = page.getByTestId("checkout-subtotal");
    this.shippingCost = page.getByTestId("checkout-shipping");
    this.tax = page.getByTestId("checkout-tax");
    this.total = page.getByTestId("checkout-total");
    this.placeOrderButton = page.getByTestId("place-order-button");
    this.backToCartLink = page.getByRole("link", { name: /back to cart|edit cart/i });
    this.errorMessages = page.getByRole("alert");
  }

  async goto() {
    await this.page.goto("/checkout");
    await this.waitForPageLoad();
  }

  async expectCheckoutVisible() {
    await expect(this.pageTitle).toBeVisible();
    await expect(this.orderSummary).toBeVisible();
  }

  async fillContactInfo(email: string, phone?: string) {
    await this.emailInput.fill(email);
    if (phone) {
      await this.phoneInput.fill(phone);
    }
  }

  async fillShippingAddress(address: typeof testCustomer.shipping) {
    await this.shippingNameInput.fill(address.name);
    await this.shippingAddressInput.fill(address.address);
    await this.shippingCityInput.fill(address.city);
    await this.shippingStateInput.fill(address.state);
    await this.shippingZipInput.fill(address.zip);
    if (await this.shippingCountrySelect.isVisible()) {
      await this.shippingCountrySelect.selectOption(address.country);
    }
  }

  async fillCompleteForm(customer: typeof testCustomer = testCustomer) {
    await this.fillContactInfo(customer.email, customer.phone);
    await this.fillShippingAddress(customer.shipping);
  }

  async placeOrder(): Promise<string> {
    await this.placeOrderButton.click();
    await this.page.waitForURL(/\/orders\/.*\/confirmation/, { timeout: 15000 });
    const url = this.page.url();
    const match = url.match(/\/orders\/([^/]+)\/confirmation/);
    return match ? match[1] : "";
  }

  async expectValidationError(fieldName?: string) {
    if (fieldName) {
      const fieldError = this.page.getByText(new RegExp(`${fieldName}.*required|invalid.*${fieldName}`, "i"));
      await expect(fieldError).toBeVisible();
    } else {
      await expect(this.errorMessages.first()).toBeVisible();
    }
  }

  async getTotal(): Promise<string> {
    return (await this.total.textContent()) || "";
  }

  async expectOrderItemsCount(count: number) {
    await expect(this.orderItems).toHaveCount(count);
  }
}
