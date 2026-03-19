import "dotenv/config";
import express from "express";
import jwt from "jsonwebtoken";
import "./notificationService.js";
import { createStudent, listStudents } from "./studentService.js";

const app = express();
const port = process.env.PORT || 4001;
const jwtSecret = process.env.JWT_SECRET || "dev_secret_change_me";

app.use(express.json());

function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Missing or invalid Authorization header." });
  }

  try {
    req.user = jwt.verify(token, jwtSecret);
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

app.get("/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.post("/auth/token", (req, res) => {
  const { email, name } = req.body || {};
  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  const token = jwt.sign({ email, name: name || "student" }, jwtSecret, {
    expiresIn: "1h",
  });

  return res.json({ token });
});

app.get("/students", auth, (_req, res) => {
  res.json({ students: listStudents() });
});

app.post("/students", auth, (req, res) => {
  const { name, email } = req.body || {};
  if (!name || !email) {
    return res.status(400).json({ message: "Name and email are required." });
  }

  const student = createStudent({ name, email });
  return res.status(201).json({ message: "Student created.", student });
});

app.listen(port, () => {
  console.log(`Event system running on http://localhost:${port}`);
});
