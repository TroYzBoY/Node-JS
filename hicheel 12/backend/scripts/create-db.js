require("dotenv").config();
const mysql = require("mysql2/promise");

async function createDatabase() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error("DATABASE_URL is not set.");
  }

  const url = new URL(dbUrl);
  const database = url.pathname.replace("/", "");

  const connection = await mysql.createConnection({
    host: url.hostname,
    port: Number(url.port || 3306),
    user: url.username,
    password: url.password,
  });

  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
  await connection.end();

  console.log(`Database ready: ${database}`);
}

createDatabase().catch((error) => {
  console.error("Create DB error:", error);
  process.exit(1);
});
