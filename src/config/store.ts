/**
 * Store Theme Configuration
 * 
 * This file contains all store-specific branding and configuration.
 * To adapt this store for a different product type, modify this file.
 */

export const storeConfig = {
  // Store identity
  name: "Cocoa & Co.",
  tagline: "Artisan Chocolates, Crafted with Love",
  description: "Discover our handcrafted selection of premium chocolates, truffles, and confections made with the finest ingredients.",
  
  // Contact
  email: "hello@cocoaandco.com",
  phone: "+1 (555) 123-4567",
  
  // Social links
  social: {
    instagram: "https://instagram.com/cocoaandco",
    facebook: "https://facebook.com/cocoaandco",
    twitter: "https://twitter.com/cocoaandco",
  },
  
  // Branding colors (CSS custom properties)
  colors: {
    primary: "#4A3728", // Rich chocolate brown
    secondary: "#D4A574", // Caramel gold
    accent: "#8B4513", // Saddle brown
    background: "#FDF8F3", // Cream
    text: "#2D2013", // Dark brown
  },
  
  // Hero section
  hero: {
    title: "Indulge in Perfection",
    subtitle: "Handcrafted chocolates made with passion and the world's finest cacao",
    ctaText: "Shop Collection",
    ctaLink: "/products",
    imageUrl: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=1200",
  },
  
  // Feature highlights
  features: [
    {
      icon: "leaf",
      title: "Ethically Sourced",
      description: "Direct trade relationships with cacao farmers",
    },
    {
      icon: "award",
      title: "Award Winning",
      description: "Recognized for exceptional quality and taste",
    },
    {
      icon: "gift",
      title: "Perfect Gifts",
      description: "Beautifully packaged for any occasion",
    },
    {
      icon: "truck",
      title: "Fresh Delivery",
      description: "Temperature-controlled shipping nationwide",
    },
  ],
  
  // Footer content
  footer: {
    about: "Cocoa & Co. has been crafting artisan chocolates since 2020. Every piece is made by hand in our Brooklyn kitchen using traditional techniques and the finest ingredients.",
    copyright: "© 2024 Cocoa & Co. All rights reserved.",
  },
  
  // SEO
  seo: {
    title: "Cocoa & Co. | Artisan Chocolates",
    description: "Discover handcrafted artisan chocolates, truffles, and confections. Made with premium ingredients and crafted with love.",
    keywords: ["chocolate", "artisan chocolate", "truffles", "gift boxes", "handcrafted", "premium chocolate"],
  },
  
  // Product-specific features (enable/disable based on store type)
  features_enabled: {
    giftWrapping: true,
    dietaryFilters: true,
    seasonalCollections: true,
    subscriptionBoxes: false, // Future feature
  },
  
  // Currency and locale
  currency: {
    code: "USD",
    symbol: "$",
    locale: "en-US",
  },
} as const;

export type StoreConfig = typeof storeConfig;
