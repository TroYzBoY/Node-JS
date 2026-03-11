require("dotenv").config();

const mysql = require("mysql2/promise");
const { baseConfig } = require("../src/db/mysql");

async function main() {
  const dbName = baseConfig.database;
  const serverConn = await mysql.createConnection({
    host: baseConfig.host,
    port: baseConfig.port,
    user: baseConfig.user,
    password: baseConfig.password,
  });

  await serverConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
  await serverConn.changeUser({ database: dbName });

  await serverConn.query(`
    CREATE TABLE IF NOT EXISTS students (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(120) NOT NULL,
      grade INT NOT NULL,
      created_at DATETIME NOT NULL
    )
  `);

  try {
    await serverConn.query(
      "CREATE INDEX idx_students_created_at ON students(created_at)"
    );
  } catch (err) {
    if (err.code !== "ER_DUP_KEYNAME") throw err;
  }

  await serverConn.query(`
    CREATE TABLE IF NOT EXISTS grades (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT NOT NULL,
      score INT NOT NULL,
      created_at DATETIME NOT NULL,
      INDEX idx_grades_student_id (student_id)
    )
  `);

  try {
    await serverConn.query(
      "CREATE INDEX idx_grades_student_id ON grades(student_id)"
    );
  } catch (err) {
    if (err.code !== "ER_DUP_KEYNAME") throw err;
  }

  await serverConn.query(`
    CREATE TABLE IF NOT EXISTS courses (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      created_at DATETIME NOT NULL
    )
  `);

  await serverConn.query(`
    CREATE TABLE IF NOT EXISTS announcements (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      created_at DATETIME NOT NULL
    )
  `);

  await serverConn.end();
  console.log("Setup complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
