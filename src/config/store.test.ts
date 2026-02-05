import { describe, it, expect } from "vitest";
import { storeConfig } from "./store";

describe("Store Configuration", () => {
  it("should have a store name", () => {
    expect(storeConfig.name).toBeDefined();
    expect(storeConfig.name.length).toBeGreaterThan(0);
  });

  it("should have valid currency configuration", () => {
    expect(storeConfig.currency.code).toBe("USD");
    expect(storeConfig.currency.symbol).toBe("$");
    expect(storeConfig.currency.locale).toBe("en-US");
  });

  it("should have SEO configuration", () => {
    expect(storeConfig.seo.title).toBeDefined();
    expect(storeConfig.seo.description).toBeDefined();
    expect(storeConfig.seo.keywords).toBeInstanceOf(Array);
  });

  it("should have hero section configuration", () => {
    expect(storeConfig.hero.title).toBeDefined();
    expect(storeConfig.hero.ctaText).toBeDefined();
    expect(storeConfig.hero.ctaLink).toBe("/products");
  });

  it("should have feature flags", () => {
    expect(typeof storeConfig.features_enabled.giftWrapping).toBe("boolean");
    expect(typeof storeConfig.features_enabled.dietaryFilters).toBe("boolean");
  });
});
