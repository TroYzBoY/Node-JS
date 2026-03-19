const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { PrismaClient } = require("@prisma/client");
const { createClient } = require("redis");
require("dotenv").config();

const app = express();
const prisma = new PrismaClient();

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const redis = createClient({ url: redisUrl });

app.use(cors());
app.use(helmet());
app.use(express.json());

const cacheGet = async (key) => {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    return null;
  }
};

const cacheSet = async (key, value, ttlSeconds = 60) => {
  try {
    await redis.setEx(key, ttlSeconds, JSON.stringify(value));
  } catch (err) {
    // ignore cache write errors
  }
};

const cacheDel = async (key) => {
  try {
    await redis.del(key);
  } catch (err) {
    // ignore cache delete errors
  }
};

app.get("/", (req, res) => {
  res.json({
    message: "Backend is running",
    time: new Date().toISOString(),
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/students", async (req, res) => {
  const cacheKey = "students:all";
  const cached = await cacheGet(cacheKey);
  if (cached) {
    return res.json({ source: "cache", data: cached });
  }

  const students = await prisma.student.findMany({
    orderBy: { id: "desc" },
  });

  await cacheSet(cacheKey, students, 60);
  res.json({ source: "db", data: students });
});

app.get("/students/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ message: "Invalid id" });
  }

  const cacheKey = `students:${id}`;
  const cached = await cacheGet(cacheKey);
  if (cached) {
    return res.json({ source: "cache", data: cached });
  }

  const student = await prisma.student.findUnique({ where: { id } });
  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  await cacheSet(cacheKey, student, 60);
  res.json({ source: "db", data: student });
});

app.post("/students", async (req, res) => {
  const { name, email } = req.body || {};
  if (!name || !email) {
    return res.status(400).json({ message: "name and email are required" });
  }

  try {
    const student = await prisma.student.create({
      data: { name, email },
    });

    await cacheDel("students:all");
    res.status(201).json(student);
  } catch (err) {
    if (err?.code === "P2002") {
      return res.status(409).json({ message: "Email already exists" });
    }
    res.status(500).json({ message: "Create failed" });
  }
});

app.put("/students/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { name, email } = req.body || {};
  if (!Number.isInteger(id)) {
    return res.status(400).json({ message: "Invalid id" });
  }
  if (!name && !email) {
    return res.status(400).json({ message: "name or email is required" });
  }

  try {
    const student = await prisma.student.update({
      where: { id },
      data: { name, email },
    });
    await cacheDel("students:all");
    await cacheDel(`students:${id}`);
    res.json(student);
  } catch (err) {
    if (err?.code === "P2002") {
      return res.status(409).json({ message: "Email already exists" });
    }
    res.status(404).json({ message: "Student not found" });
  }
});

app.delete("/students/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ message: "Invalid id" });
  }

  try {
    await prisma.student.delete({ where: { id } });
    await cacheDel("students:all");
    await cacheDel(`students:${id}`);
    res.status(204).send();
  } catch (err) {
    res.status(404).json({ message: "Student not found" });
  }
});

const port = Number(process.env.PORT) || 4000;

const start = async () => {
  redis.on("error", (err) => {
    // eslint-disable-next-line no-console
    console.error("Redis error:", err?.message || err);
  });

  await prisma.$connect();
  await redis.connect();

  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on http://localhost:${port}`);
  });
};

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Startup error:", err?.message || err);
  process.exit(1);
});
