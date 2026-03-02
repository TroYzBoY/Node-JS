import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const rounds = Number(process.env.BCRYPT_ROUNDS || 12);
  const adminPassword = await bcrypt.hash("admin123", rounds);
  const teacherPassword = await bcrypt.hash("teacher123", rounds);
  const studentPassword = await bcrypt.hash("student123", rounds);

  await prisma.user.createMany({
    data: [
      {
        username: "admin",
        email: "admin@example.com",
        password: adminPassword,
        role: "ADMIN",
      },
      {
        username: "teacher",
        email: "teacher@example.com",
        password: teacherPassword,
        role: "TEACHER",
      },
      {
        username: "student",
        email: "student@example.com",
        password: studentPassword,
        role: "STUDENT",
      },
    ],
    skipDuplicates: true,
  });


}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });