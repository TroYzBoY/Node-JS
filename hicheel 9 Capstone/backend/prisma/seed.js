const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const DEFAULT_PASSWORD_HASH =
  "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"; // Password123!

async function main() {
  const adminPasswordHash = await bcrypt.hash("TroYzBoY#4023", 10);

  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.oAuthAccount.deleteMany();
  await prisma.user.deleteMany();

  const [admin, seller, customer] = await Promise.all([
    prisma.user.create({
      data: {
        name: "Admin User",
        email: "troyzboy4023@gmail.com",
        password: adminPasswordHash,
        role: "ADMIN",
        provider: "LOCAL",
      },
    }),
    prisma.user.create({
      data: {
        name: "Seller User",
        email: "seller@capstone.mn",
        password: DEFAULT_PASSWORD_HASH,
        role: "SELLER",
        provider: "LOCAL",
      },
    }),
    prisma.user.create({
      data: {
        name: "Customer User",
        email: "customer@capstone.mn",
        password: DEFAULT_PASSWORD_HASH,
        role: "CUSTOMER",
        provider: "LOCAL",
      },
    }),
  ]);

  const [electronics, books] = await Promise.all([
    prisma.category.create({ data: { name: "Electronics" } }),
    prisma.category.create({ data: { name: "Books" } }),
  ]);

  const [phone, laptop, book] = await Promise.all([
    prisma.product.create({
      data: {
        name: "iPhone 15",
        description: "128GB, black",
        price: "4200000.00",
        stock: 12,
        categoryId: electronics.id,
        sellerId: seller.id,
      },
    }),
    prisma.product.create({
      data: {
        name: "MacBook Air M3",
        description: "13-inch",
        price: "5200000.00",
        stock: 8,
        categoryId: electronics.id,
        sellerId: seller.id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Clean Code",
        description: "Programming book",
        price: "95000.00",
        stock: 40,
        categoryId: books.id,
        sellerId: seller.id,
      },
    }),
  ]);

  const cart = await prisma.cart.create({
    data: {
      userId: customer.id,
    },
  });

  await prisma.cartItem.createMany({
    data: [
      { cartId: cart.id, productId: phone.id, quantity: 1 },
      { cartId: cart.id, productId: book.id, quantity: 2 },
    ],
  });

  const order = await prisma.order.create({
    data: {
      userId: customer.id,
      totalPrice: "4390000.00",
      status: "PENDING",
    },
  });

  await prisma.orderItem.createMany({
    data: [
      { orderId: order.id, productId: phone.id, quantity: 1, price: "4200000.00" },
      { orderId: order.id, productId: book.id, quantity: 2, price: "95000.00" },
    ],
  });

  console.log("Seed completed");
  console.log({ adminId: admin.id, sellerId: seller.id, customerId: customer.id });
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
