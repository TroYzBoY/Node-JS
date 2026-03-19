const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../prisma");
const { publishEvent } = require("../queue/rabbit");

const router = express.Router();

const jwtSecret = process.env.JWT_SECRET || "dev_secret_change_me";

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, password are required." });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: "Email already registered." });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashed },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    try {
      await publishEvent("user.registered", user);
    } catch (error) {
      console.error("RabbitMQ publish failed:", error);
      await prisma.user.delete({ where: { id: user.id } });
      return res.status(503).json({ message: "Queue unavailable. Please try again." });
    }

    return res.status(201).json({ message: "Registered successfully.", user });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "Server error." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign(
      { sub: user.id, email: user.email, name: user.name },
      jwtSecret,
      { expiresIn: "1h" }
    );

    try {
      await publishEvent("user.logged_in", {
        id: user.id,
        name: user.name,
        email: user.email,
        loggedInAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("RabbitMQ publish failed:", error);
      return res.status(503).json({ message: "Queue unavailable. Please try again." });
    }

    return res.json({
      message: "Login successful.",
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;
