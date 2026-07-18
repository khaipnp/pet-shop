import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://petshop:petshop_pass@172.19.0.1:5432/pet_shop",
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const seed = async () => {
  console.log("🌱 Seeding...");

  // ── Admin user ──
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@petshop.com" },
    update: {},
    create: {
      email: "admin@petshop.com",
      password: adminPassword,
      name: "Admin",
      role: "ADMIN",
    },
  });
  console.log(`  ✅ Admin: ${admin.email}`);

  // ── Categories ──
  const categories = [
    { name: "Thức ăn cho chó", slug: "thuc-an-cho-cho", petType: "dog", icon: "🐕" },
    { name: "Thức ăn cho mèo", slug: "thuc-an-cho-meo", petType: "cat", icon: "🐈" },
    { name: "Đồ chơi cho thú cưng", slug: "do-choi", petType: "both", icon: "🎾" },
    { name: "Phụ kiện & Vòng cổ", slug: "phu-kien", petType: "both", icon: "🦴" },
    { name: "Vệ sinh & Chăm sóc", slug: "ve-sinh", petType: "both", icon: "🧴" },
    { name: "Quần áo thú cưng", slug: "quan-ao", petType: "both", icon: "👕" },
    { name: "Sữa tắm & Dưỡng lông", slug: "sua-tam-duong-long", petType: "both", icon: "🧼" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log(`  ✅ ${categories.length} categories`);

  // ── Products ──
  const products = [
    // Dog food
    {
      name: "Hạt Royal Canin Medium Adult 15kg",
      slug: "royal-canin-medium-adult-15kg",
      description: "Thức ăn cao cấp dành cho chó trưởng thành giống trung bình (11-25kg). Giàu protein, vitamin và khoáng chất giúp chó khỏe mạnh, lông bóng mượt.",
      price: 985000,
      compareAt: 1100000,
      stock: 50,
      categorySlug: "thuc-an-cho-cho",
      petType: "dog",
      featured: true,
      images: ["/images/products/dog-food-1.jpg"],
      tags: ["royal-canin", "thuc-an-cho", "adult"],
    },
    {
      name: "Pate Whiskas Cá Biển 85g",
      slug: "pate-whiskas-ca-bien-85g",
      description: "Pate thơm ngon vị cá biển cho mèo. Giàu protein và taurine, hỗ trợ tiêu hóa và thị lực.",
      price: 15000,
      compareAt: null,
      stock: 200,
      categorySlug: "thuc-an-cho-meo",
      petType: "cat",
      featured: true,
      images: ["/images/products/cat-food-1.jpg"],
      tags: ["whiskas", "pate", "cat-food"],
    },
    {
      name: "Hạt Taste of Wild High Prairie 12.2kg",
      slug: "taste-of-wild-high-prairie-12kg",
      description: "Thức ăn không hạt, giàu đạm từ thịt bò rừng & thịt heo rừng. Công thức tự nhiên cho chó mọi lứa tuổi.",
      price: 1250000,
      compareAt: 1450000,
      stock: 30,
      categorySlug: "thuc-an-cho-cho",
      petType: "dog",
      featured: true,
      images: ["/images/products/dog-food-2.jpg"],
      tags: ["taste-of-wild", "grain-free", "premium"],
    },
    {
      name: "Hạt Royal Canin Feline Sterilised 7+ 4kg",
      slug: "royal-canin-feline-sterilised-7-4kg",
      description: "Dành cho mèo trên 7 tuổi đã triệt sản. Giúp kiểm soát cân nặng và hỗ trợ thận.",
      price: 550000,
      compareAt: null,
      stock: 40,
      categorySlug: "thuc-an-cho-meo",
      petType: "cat",
      featured: false,
      images: ["/images/products/cat-food-2.jpg"],
      tags: ["royal-canin", "thuc-an-meo", "senior"],
    },

    // Toys
    {
      name: "Bóng tennis cho chó (3 quả)",
      slug: "bong-tennis-cho-cho-3-qua",
      description: "Bóng tennis chuyên dụng cho chó. Chất liệu cao su an toàn, độ nảy tốt. Set 3 quả.",
      price: 45000,
      compareAt: null,
      stock: 150,
      categorySlug: "do-choi",
      petType: "dog",
      featured: true,
      images: ["/images/products/toy-1.jpg"],
      tags: ["bong", "do-choi-cho", "tennis"],
    },
    {
      name: "Cào móng mèo hình cây dừa",
      slug: "cao-mong-meo-hinh-cay-dua",
      description: "Cào móng kết hợp nhà nghỉ cho mèo. Thiết kế hình cây dừa độc đáo, chất liệu sisal bền đẹp.",
      price: 320000,
      compareAt: 380000,
      stock: 20,
      categorySlug: "do-choi",
      petType: "cat",
      featured: true,
      images: ["/images/products/toy-2.jpg"],
      tags: ["cao-mong", "do-choi-meo", "sisal"],
    },
    {
      name: "Đồ chơi kéo co dây thừng",
      slug: "do-choi-keo-co-day-thung",
      description: "Đồ chơi kéo co bằng dây thừng tự nhiên. Giúp chó giải trí và vệ sinh răng miệng.",
      price: 55000,
      compareAt: null,
      stock: 100,
      categorySlug: "do-choi",
      petType: "dog",
      featured: false,
      images: ["/images/products/toy-3.jpg"],
      tags: ["keo-co", "day-thung", "do-choi-cho"],
    },

    // Accessories
    {
      name: "Vòng cổ chó chống ve rận (Size M)",
      slug: "vong-co-cho-chong-ve-ran-size-m",
      description: "Vòng cổ chống ve rận hiệu quả đến 8 tháng. Chất liệu silicone an toàn, không thấm nước.",
      price: 185000,
      compareAt: 220000,
      stock: 60,
      categorySlug: "phu-kien",
      petType: "dog",
      featured: false,
      images: ["/images/products/accessory-1.jpg"],
      tags: ["vong-co", "chong-ve", "phu-kien-cho"],
    },
    {
      name: "Dây dắt chó tự động 5m",
      slug: "day-dat-cho-tu-dong-5m",
      description: "Dây dắt tự động, dài 5m. Dễ dàng điều khiển, khóa an toàn, phù hợp chó dưới 15kg.",
      price: 150000,
      compareAt: null,
      stock: 80,
      categorySlug: "phu-kien",
      petType: "dog",
      featured: true,
      images: ["/images/products/accessory-2.jpg"],
      tags: ["day-dat", "tu-dong", "phu-kien-cho"],
    },

    // Grooming
    {
      name: "Sữa tắm Bio-Groom Super Cream 500ml",
      slug: "sua-tam-bio-groom-super-cream-500ml",
      description: "Sữa tắm dưỡng lông cao cấp cho chó mèo. Với lanolin và collagen, giúp lông mềm mượt, giảm rụng.",
      price: 250000,
      compareAt: 290000,
      stock: 35,
      categorySlug: "sua-tam-duong-long",
      petType: "both",
      featured: true,
      images: ["/images/products/shampoo-1.jpg"],
      tags: ["sua-tam", "bio-groom", "duong-long"],
    },
    {
      name: "Bàn chải lông cho chó mèo (Tự động)",
      slug: "ban-chai-long-cho-cho-meo-tu-dong",
      description: "Bàn chải lông tự động với lưỡi thép không gỉ. Giúp loại bỏ lông chết, massage da.",
      price: 85000,
      compareAt: null,
      stock: 70,
      categorySlug: "ve-sinh",
      petType: "both",
      featured: false,
      images: ["/images/products/brush-1.jpg"],
      tags: ["ban-chai", "long-cho", "ve-sinh"],
    },

    // Clothes
    {
      name: "Áo thun doggy họa tiết xương cá",
      slug: "ao-thun-doggy-hoa-tiet-xuong-ca",
      description: "Áo thun cotton thoáng mát cho chó. Họa tiết xương cá đáng yêu. Phù hợp mùa hè.",
      price: 99000,
      compareAt: 130000,
      stock: 45,
      categorySlug: "quan-ao",
      petType: "dog",
      featured: true,
      images: ["/images/products/clothes-1.jpg"],
      tags: ["ao-thun", "quan-ao-cho", "summer"],
    },
    {
      name: "Set áo hoodie + quần yếm cho mèo",
      slug: "set-ao-hoodie-may-mac-meo",
      description: "Bộ hoodie + quần yếm ấm áp cho mèo. Chất nỉ mềm mại, dễ mặc. Phù hợp thời tiết lạnh.",
      price: 149000,
      compareAt: 179000,
      stock: 25,
      categorySlug: "quan-ao",
      petType: "cat",
      featured: false,
      images: ["/images/products/clothes-2.jpg"],
      tags: ["hoodie", "quan-ao-meo", "winter"],
    },
  ];

  for (const product of products) {
    const category = await prisma.category.findUnique({ where: { slug: product.categorySlug } });
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        compareAt: product.compareAt,
        stock: product.stock,
        status: "ACTIVE",
        featured: product.featured,
        petType: product.petType,
        categoryId: category?.id || null,
        images: product.images,
        tags: product.tags,
      },
    });
  }
  console.log(`  ✅ ${products.length} products`);

  console.log("🎉 Seed completed!");
};

seed()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
