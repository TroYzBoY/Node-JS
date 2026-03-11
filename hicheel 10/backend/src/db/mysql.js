const mysql = require("mysql2/promise");

function getDbConfig() {
  const url = process.env.DATABASE_URL;
  if (url) {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: parsed.port ? Number(parsed.port) : 3306,
      user: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
      database: parsed.pathname.replace(/^\//, ""),
    };
  }

  return {
    host: process.env.DB_HOST || "127.0.0.1",
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "school_management_redis_db",
  };
}

const baseConfig = getDbConfig();

const pool = mysql.createPool({
  ...baseConfig,
  connectionLimit: process.env.DB_POOL_LIMIT
    ? Number(process.env.DB_POOL_LIMIT)
    : 10,
});

async function queryPool(sql, params, counter) {
  if (counter) counter.count += 1;
  return pool.query(sql, params);
}

async function querySingle(sql, params, counter) {
  const conn = await mysql.createConnection(baseConfig);
  try {
    if (counter) counter.count += 1;
    return await conn.query(sql, params);
  } finally {
    await conn.end();
  }
}

async function withConnection(fn) {
  const conn = await mysql.createConnection(baseConfig);
  try {
    return await fn(conn);
  } finally {
    await conn.end();
  }
}

module.exports = {
  baseConfig,
  pool,
  queryPool,
  querySingle,
  withConnection,
};
