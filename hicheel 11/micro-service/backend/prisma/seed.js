require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  await prisma.borrow.deleteMany();
  await prisma.book.deleteMany();
  await prisma.user.deleteMany();

  const users = await prisma.user.createMany({
    data: [
      { name: 'Alice' },
      { name: 'Bob' },
      { name: 'Charlie' }
    ]
  });

  const books = await prisma.book.createMany({
    data: [
      { title: 'Clean Code', author: 'Robert C. Martin', available: true },
      { title: 'The Pragmatic Programmer', author: 'Andrew Hunt', available: true },
      { title: 'Design Patterns', author: 'Erich Gamma', available: true },
      { title: 'Refactoring', author: 'Martin Fowler', available: true }
    ]
  });

  console.log('Seed complete', { users, books });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
