require("dotenv").config();

const { faker } = require("@faker-js/faker");
const mysql = require("mysql2/promise");
const { baseConfig } = require("../src/db/mysql");

const TOTAL_STUDENTS = process.env.SEED_STUDENTS
  ? Number(process.env.SEED_STUDENTS)
  : 100000;
const BATCH_SIZE = process.env.SEED_BATCH ? Number(process.env.SEED_BATCH) : 1000;
const RESET = process.env.SEED_RESET !== "0";

function randomDate(start, end) {
  return faker.date.between({ from: start, to: end });
}

async function main() {
  const conn = await mysql.createConnection(baseConfig);

  if (RESET) {
    await conn.query("SET FOREIGN_KEY_CHECKS=0");
    await conn.query("TRUNCATE TABLE grades");
    await conn.query("TRUNCATE TABLE students");
    await conn.query("TRUNCATE TABLE courses");
    await conn.query("TRUNCATE TABLE announcements");
    await conn.query("SET FOREIGN_KEY_CHECKS=1");
  }

  console.log(`Seeding ${TOTAL_STUDENTS} students...`);

  let inserted = 0;
  while (inserted < TOTAL_STUDENTS) {
    const batch = Math.min(BATCH_SIZE, TOTAL_STUDENTS - inserted);
    const studentValues = [];

    for (let i = 0; i < batch; i += 1) {
      const index = inserted + i + 1;
      studentValues.push([
        faker.person.fullName(),
        `s${index}@mail.com`,
        faker.number.int({ min: 9, max: 12 }),
        randomDate("2020-01-01", "2025-12-31"),
      ]);
    }

    const [result] = await conn.query(
      "INSERT INTO students (name, email, grade, created_at) VALUES ?",
      [studentValues]
    );

    const startId = result.insertId;
    const gradeValues = [];
    for (let i = 0; i < batch; i += 1) {
      gradeValues.push([
        startId + i,
        faker.number.int({ min: 50, max: 100 }),
        randomDate("2020-01-01", "2025-12-31"),
      ]);
    }

    await conn.query(
      "INSERT INTO grades (student_id, score, created_at) VALUES ?",
      [gradeValues]
    );

    inserted += batch;
    console.log(`Inserted ${inserted}/${TOTAL_STUDENTS}`);
  }

  const courseCount = 50;
  const courseValues = [];
  for (let i = 0; i < courseCount; i += 1) {
    courseValues.push([
      faker.company.buzzPhrase(),
      randomDate("2023-01-01", "2025-12-31"),
    ]);
  }
  await conn.query(
    "INSERT INTO courses (name, created_at) VALUES ?",
    [courseValues]
  );

  const announcementCount = 20;
  const announcementValues = [];
  for (let i = 0; i < announcementCount; i += 1) {
    announcementValues.push([
      faker.company.catchPhrase(),
      randomDate("2024-01-01", "2025-12-31"),
    ]);
  }
  await conn.query(
    "INSERT INTO announcements (title, created_at) VALUES ?",
    [announcementValues]
  );

  await conn.end();
  console.log("Seed complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
