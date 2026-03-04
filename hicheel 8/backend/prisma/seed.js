import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const students = [
  { name: "Bat Erdene", email: "bat.erdene@example.com", grade: 11, gpa: 3.8, role: "STUDENT" },
  { name: "Sarnai T", email: "sarnai.t@example.com", grade: 10, gpa: 3.6, role: "STUDENT" },
  { name: "Dorj B", email: "dorj.b@example.com", grade: 12, gpa: 2.9, role: "STUDENT" },
  { name: "Enkhjin L", email: "enkhjin.l@example.com", grade: 11, gpa: 3.9, role: "TEACHER" },
  { name: "Nomin G", email: "nomin.g@example.com", grade: 9, gpa: 3.4, role: "STUDENT" },
  { name: "Admin User", email: "admin@example.com", grade: 12, gpa: 4.0, role: "ADMIN" }
];

async function main() {
  for (const student of students) {
    await prisma.student.upsert({
      where: { email: student.email },
      update: {
        name: student.name,
        grade: student.grade,
        gpa: student.gpa,
        role: student.role
      },
      create: student
    });
  }

  console.log(`Seed complete: ${students.length} students upserted.`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
