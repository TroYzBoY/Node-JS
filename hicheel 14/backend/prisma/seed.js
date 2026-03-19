const { PrismaClient } = require("@prisma/client");
const { faker } = require("@faker-js/faker");

const prisma = new PrismaClient();

const makeStudents = (count) =>
  Array.from({ length: count }).map(() => ({
    name: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
  }));

const main = async () => {
  const count = Number(process.env.SEED_COUNT) || 20;

  await prisma.student.deleteMany();
  await prisma.student.createMany({
    data: makeStudents(count),
    skipDuplicates: true,
  });
};

main()
  .then(async () => {
    await prisma.$disconnect();
    // eslint-disable-next-line no-console
    console.log("Seed complete");
  })
  .catch(async (err) => {
    // eslint-disable-next-line no-console
    console.error("Seed failed:", err);
    await prisma.$disconnect();
    process.exit(1);
  });
