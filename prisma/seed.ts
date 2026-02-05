import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🍫 Seeding database with chocolate products...\n");

  // Clear existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: "Truffles",
        slug: "truffles",
        description: "Handcrafted chocolate truffles with premium fillings",
        sortOrder: 1,
      },
    }),
    prisma.category.create({
      data: {
        name: "Chocolate Bars",
        slug: "chocolate-bars",
        description: "Artisan chocolate bars in various flavors",
        sortOrder: 2,
      },
    }),
    prisma.category.create({
      data: {
        name: "Gift Boxes",
        slug: "gift-boxes",
        description: "Beautifully curated chocolate gift boxes",
        sortOrder: 3,
      },
    }),
    prisma.category.create({
      data: {
        name: "Hot Chocolate",
        slug: "hot-chocolate",
        description: "Rich and creamy hot chocolate mixes",
        sortOrder: 4,
      },
    }),
    prisma.category.create({
      data: {
        name: "Seasonal",
        slug: "seasonal",
        description: "Limited edition seasonal chocolates",
        sortOrder: 5,
      },
    }),
  ]);

  const [truffles, bars, giftBoxes, hotChocolate, seasonal] = categories;

  // Create products
  const products = [
    // Truffles
    {
      name: "Classic Dark Truffle Collection",
      slug: "classic-dark-truffle-collection",
      description:
        "A luxurious collection of 12 handcrafted dark chocolate truffles with smooth ganache centers. Each truffle is made with 72% single-origin cacao.",
      price: 28.99,
      imageUrl: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=800",
      inStock: true,
      stockCount: 50,
      featured: true,
      categoryId: truffles.id,
      metadata: { pieces: 12, dietary: ["gluten-free"] },
    },
    {
      name: "Salted Caramel Truffles",
      slug: "salted-caramel-truffles",
      description:
        "Decadent milk chocolate truffles filled with buttery salted caramel. Hand-finished with a sprinkle of Fleur de Sel.",
      price: 24.99,
      imageUrl: "https://images.unsplash.com/photo-1548907040-4baa42d10919?w=800",
      inStock: true,
      stockCount: 35,
      featured: true,
      categoryId: truffles.id,
      metadata: { pieces: 9, dietary: ["gluten-free"] },
    },
    {
      name: "Champagne Truffles",
      slug: "champagne-truffles",
      description:
        "Elegant white chocolate truffles infused with real champagne. Perfect for celebrations.",
      price: 32.99,
      imageUrl: "https://images.unsplash.com/photo-1511381939415-e44015466834?w=800",
      inStock: true,
      stockCount: 25,
      featured: false,
      categoryId: truffles.id,
      metadata: { pieces: 12, dietary: ["gluten-free"], contains: ["alcohol"] },
    },
    
    // Chocolate Bars
    {
      name: "72% Dark Chocolate Bar",
      slug: "72-dark-chocolate-bar",
      description:
        "Intense and complex single-origin dark chocolate from Madagascar. Notes of red fruit and citrus.",
      price: 8.99,
      imageUrl: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=800",
      inStock: true,
      stockCount: 100,
      featured: true,
      categoryId: bars.id,
      metadata: { weight: "100g", dietary: ["vegan", "gluten-free"] },
    },
    {
      name: "Milk Chocolate Hazelnut Bar",
      slug: "milk-chocolate-hazelnut-bar",
      description:
        "Creamy milk chocolate studded with roasted Piedmont hazelnuts. Irresistibly crunchy.",
      price: 9.99,
      imageUrl: "https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=800",
      inStock: true,
      stockCount: 75,
      featured: false,
      categoryId: bars.id,
      metadata: { weight: "100g", dietary: [], contains: ["nuts", "milk"] },
    },
    {
      name: "Sea Salt & Almond Dark Bar",
      slug: "sea-salt-almond-dark-bar",
      description:
        "60% dark chocolate with Marcona almonds and a touch of Mediterranean sea salt.",
      price: 10.99,
      imageUrl: "https://images.unsplash.com/photo-1623660053975-cf75a8be0908?w=800",
      inStock: true,
      stockCount: 60,
      featured: false,
      categoryId: bars.id,
      metadata: { weight: "100g", dietary: ["gluten-free"], contains: ["nuts"] },
    },
    
    // Gift Boxes
    {
      name: "Luxury Assortment Box",
      slug: "luxury-assortment-box",
      description:
        "An exquisite selection of 24 handcrafted chocolates including truffles, pralines, and ganaches. Presented in an elegant gift box.",
      price: 54.99,
      compareAtPrice: 64.99,
      imageUrl: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=800",
      inStock: true,
      stockCount: 20,
      featured: true,
      categoryId: giftBoxes.id,
      metadata: { pieces: 24, dietary: ["gluten-free"] },
    },
    {
      name: "Dark Chocolate Lovers Box",
      slug: "dark-chocolate-lovers-box",
      description:
        "A curated collection for dark chocolate enthusiasts. 18 pieces ranging from 60% to 85% cacao.",
      price: 42.99,
      imageUrl: "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=800",
      inStock: true,
      stockCount: 15,
      featured: false,
      categoryId: giftBoxes.id,
      metadata: { pieces: 18, dietary: ["vegan", "gluten-free"] },
    },
    
    // Hot Chocolate
    {
      name: "Classic Hot Chocolate Mix",
      slug: "classic-hot-chocolate-mix",
      description:
        "Rich and velvety hot chocolate made with real cocoa. Simply add hot milk for the perfect cup.",
      price: 14.99,
      imageUrl: "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=800",
      inStock: true,
      stockCount: 80,
      featured: false,
      categoryId: hotChocolate.id,
      metadata: { servings: 10, dietary: ["gluten-free"] },
    },
    {
      name: "Spiced Mexican Hot Chocolate",
      slug: "spiced-mexican-hot-chocolate",
      description:
        "A warming blend of cocoa, cinnamon, and a hint of chili. Bold and aromatic.",
      price: 16.99,
      imageUrl: "https://images.unsplash.com/photo-1517578239113-b03992dcdd25?w=800",
      inStock: true,
      stockCount: 45,
      featured: false,
      categoryId: hotChocolate.id,
      metadata: { servings: 10, dietary: ["vegan", "gluten-free"] },
    },
    
    // Seasonal
    {
      name: "Valentine's Heart Collection",
      slug: "valentines-heart-collection",
      description:
        "Heart-shaped chocolates in a romantic red box. A sweet way to say I love you.",
      price: 38.99,
      imageUrl: "https://images.unsplash.com/photo-1548907040-4baa42d10919?w=800",
      inStock: true,
      stockCount: 30,
      featured: true,
      categoryId: seasonal.id,
      metadata: { pieces: 15, dietary: ["gluten-free"], occasion: "Valentine's Day" },
    },
  ];

  for (const product of products) {
    await prisma.product.create({
      data: product,
    });
  }

  console.log(`✅ Created ${categories.length} categories`);
  console.log(`✅ Created ${products.length} products`);
  console.log("\n🍫 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
