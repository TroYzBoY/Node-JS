require("dotenv").config();

const express = require("express");
const { pool, queryPool, querySingle } = require("./db/mysql");
const { getRedis } = require("./db/redis");

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const COURSES_CACHE_TTL = process.env.COURSES_CACHE_TTL
  ? Number(process.env.COURSES_CACHE_TTL)
  : 60;
const DASHBOARD_CACHE_TTL = process.env.DASHBOARD_CACHE_TTL
  ? Number(process.env.DASHBOARD_CACHE_TTL)
  : 30;
const LOGIN_RATE_LIMIT_WINDOW = process.env.LOGIN_RATE_LIMIT_WINDOW
  ? Number(process.env.LOGIN_RATE_LIMIT_WINDOW)
  : 60;
const LOGIN_RATE_LIMIT_MAX = process.env.LOGIN_RATE_LIMIT_MAX
  ? Number(process.env.LOGIN_RATE_LIMIT_MAX)
  : 5;

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/students", async (req, res, next) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 50;
    const [rows] = await queryPool(
      "SELECT * FROM students ORDER BY id DESC LIMIT ?",
      [limit]
    );
    res.json({ rows });
  } catch (err) {
    next(err);
  }
});

app.get("/students-nopool", async (req, res, next) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 50;
    const [rows] = await querySingle(
      "SELECT * FROM students ORDER BY id DESC LIMIT ?",
      [limit]
    );
    res.json({ rows });
  } catch (err) {
    next(err);
  }
});

app.get("/students/by-email", async (req, res, next) => {
  try {
    const email = req.query.email || "s100@mail.com";
    const explain = req.query.explain === "1";
    if (explain) {
      const [rows] = await queryPool(
        "EXPLAIN SELECT * FROM students WHERE email = ?",
        [email]
      );
      return res.json({ explain: rows });
    }

    const [rows] = await queryPool(
      "SELECT * FROM students WHERE email = ?",
      [email]
    );
    res.json({ rows });
  } catch (err) {
    next(err);
  }
});

app.get("/students/by-year", async (req, res, next) => {
  try {
    const year = req.query.year ? Number(req.query.year) : 2024;
    const mode = req.query.mode || "bad"; // bad | good
    const explain = req.query.explain === "1";
    const limit = req.query.limit ? Number(req.query.limit) : 1000;

    let sql;
    let params;

    if (mode === "good") {
      const start = `${year}-01-01`;
      const end = `${year + 1}-01-01`;
      sql =
        "SELECT * FROM students WHERE created_at >= ? AND created_at < ? LIMIT ?";
      params = [start, end, limit];
    } else {
      sql = "SELECT * FROM students WHERE YEAR(created_at) = ? LIMIT ?";
      params = [year, limit];
    }

    if (explain) {
      const [rows] = await queryPool(`EXPLAIN ${sql}`, params);
      return res.json({ explain: rows });
    }

    const [rows] = await queryPool(sql, params);
    res.json({ rows });
  } catch (err) {
    next(err);
  }
});

app.get("/students/with-grades/nplus1", async (_req, res, next) => {
  const counter = { count: 0 };
  try {
    const limit = _req.query.limit ? Number(_req.query.limit) : 1000;
    const [students] = await queryPool(
      "SELECT id, name FROM students LIMIT ?",
      [limit],
      counter
    );
    const results = [];

    for (const student of students) {
      const [grades] = await queryPool(
        "SELECT score FROM grades WHERE student_id = ?",
        [student.id],
        counter
      );
      results.push({ name: student.name, grades });
    }

    res.json({ queryCount: counter.count, results });
  } catch (err) {
    next(err);
  }
});

app.get("/students/with-grades/join", async (_req, res, next) => {
  const counter = { count: 0 };
  try {
    const limit = _req.query.limit ? Number(_req.query.limit) : 1000;
    const [rows] = await queryPool(
      "SELECT students.name, grades.score FROM students JOIN grades ON students.id = grades.student_id LIMIT ?",
      [limit],
      counter
    );
    res.json({ queryCount: counter.count, rows });
  } catch (err) {
    next(err);
  }
});

app.get("/courses", async (_req, res, next) => {
  const counter = { count: 0 };
  try {
    const redis = await getRedis();
    const cached = await redis.get("courses");

    if (cached) {
      return res.json({ cache: true, rows: JSON.parse(cached) });
    }

    const [rows] = await queryPool("SELECT * FROM courses", [], counter);
    await redis.setEx("courses", COURSES_CACHE_TTL, JSON.stringify(rows));
    res.json({ cache: false, queryCount: counter.count, rows });
  } catch (err) {
    next(err);
  }
});

app.post("/courses", async (req, res, next) => {
  try {
    const name = req.body.name || `Course-${Date.now()}`;
    await queryPool("INSERT INTO courses (name, created_at) VALUES (?, NOW())", [
      name,
    ]);

    const redis = await getRedis();
    await redis.del("courses");

    res.json({ ok: true, name });
  } catch (err) {
    next(err);
  }
});

app.post("/login", async (_req, res, next) => {
  try {
    const redis = await getRedis();
    const key = "login_attempts";
    const attempts = await redis.incr(key);

    if (attempts === 1) {
      await redis.expire(key, LOGIN_RATE_LIMIT_WINDOW);
    }

    if (attempts > LOGIN_RATE_LIMIT_MAX) {
      return res.status(429).json({ ok: false, message: "Too many attempts" });
    }

    res.json({ ok: true, attempts });
  } catch (err) {
    next(err);
  }
});

app.get("/dashboard", async (_req, res, next) => {
  const counter = { count: 0 };
  try {
    const redis = await getRedis();
    const cached = await redis.get("dashboard");
    if (cached) {
      return res.json({ cache: true, data: JSON.parse(cached) });
    }

    const [students] = await queryPool("SELECT COUNT(*) AS total FROM students", [], counter);
    const [courses] = await queryPool("SELECT COUNT(*) AS total FROM courses", [], counter);
    const [grades] = await queryPool("SELECT COUNT(*) AS total FROM grades", [], counter);
    const [announcements] = await queryPool(
      "SELECT COUNT(*) AS total FROM announcements",
      [],
      counter
    );

    const data = {
      students: students[0].total,
      courses: courses[0].total,
      grades: grades[0].total,
      announcements: announcements[0].total,
      queryCount: counter.count,
    };

    await redis.setEx("dashboard", DASHBOARD_CACHE_TTL, JSON.stringify(data));
    res.json({ cache: false, data });
  } catch (err) {
    next(err);
  }
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ ok: false, error: err.message });
});

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

async function shutdown() {
  server.close();
  await pool.end();
  try {
    const redis = await getRedis();
    await redis.quit();
  } catch (_err) {
    // ignore
  }
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
