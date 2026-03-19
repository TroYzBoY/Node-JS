const express = require("express");
const prisma = require("../prisma");
const auth = require("../middleware/auth");
const { publishEvent } = require("../queue/rabbit");

const router = express.Router();

router.get("/students", auth, async (_req, res) => {
  try {
    const students = await prisma.student.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res.json({ students });
  } catch (error) {
    console.error("Students list error:", error);
    return res.status(500).json({ message: "Server error." });
  }
});

router.post("/students", auth, async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required." });
    }

    const student = await prisma.student.create({
      data: { name, email },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    try {
      await publishEvent("student.created", student);
    } catch (error) {
      console.error("RabbitMQ publish failed:", error);
      await prisma.student.delete({ where: { id: student.id } });
      return res.status(503).json({ message: "Queue unavailable. Please try again." });
    }

    return res.status(201).json({ message: "Student created.", student });
  } catch (error) {
    console.error("Student create error:", error);
    return res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;
