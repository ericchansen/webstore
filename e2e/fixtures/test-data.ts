/**
 * Test data and constants for E2E tests
 */

export const viewports = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 800 },
} as const;

export const testProducts = {
  featured: {
    name: "Salted Caramel Truffles",
    slug: "salted-caramel-truffles",
    price: "$24.99",
  },
  chocolateBar: {
    name: "72% Dark Chocolate Bar",
    slug: "72-dark-chocolate-bar",
    price: "$8.99",
  },
  giftBox: {
    name: "Luxury Assortment Box",
    slug: "luxury-assortment-box",
    price: "$54.99",
    compareAtPrice: "$64.99",
  },
} as const;

export const testCategories = [
  { name: "Truffles", slug: "truffles" },
  { name: "Chocolate Bars", slug: "chocolate-bars" },
  { name: "Gift Boxes", slug: "gift-boxes" },
  { name: "Hot Chocolate", slug: "hot-chocolate" },
  { name: "Seasonal", slug: "seasonal" },
] as const;

export const testCustomer = {
  email: "test@example.com",
  phone: "555-123-4567",
  shipping: {
    name: "Test Customer",
    address: "123 Test Street",
    city: "New York",
    state: "NY",
    zip: "10001",
    country: "US",
  },
} as const;

export const routes = {
  home: "/",
  products: "/products",
  productDetail: (slug: string) => `/products/${slug}`,
  cart: "/cart",
  checkout: "/checkout",
  orderConfirmation: (orderId: string) => `/orders/${orderId}/confirmation`,
} as const;
