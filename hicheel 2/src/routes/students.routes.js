const express = require("express");
const auth = require("../middleware/auth");
const prisma = require("../config/prisma"); // src/config/prisma.js

const router = express.Router();

// GET all students (protected)
router.get("/", auth, async (req, res, next) => {
  try {
    const students = await prisma.student.findMany();
    res.json({ students });
  } catch (err) {
    next(err);
  }
});

// GET single student by id (protected)
router.get("/:id", auth, async (req, res, next) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: parseInt(req.params.id) }
    });

    if (!student) {
      const error = new Error("Student not found");
      error.status = 404;
      throw error;
    }

    res.json({ student });
  } catch (err) {
    next(err);
  }
});

// CREATE student (protected)
router.post("/", auth, async (req, res, next) => {
  try {
    const { name, email } = req.body;

    const newStudent = await prisma.student.create({
      data: { name, email }
    });

    res.status(201).json({ student: newStudent });
  } catch (err) {
    next(err);
  }
});

// UPDATE student (protected)
router.put("/:id", auth, async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const updatedStudent = await prisma.student.update({
      where: { id: parseInt(req.params.id) },
      data: { name, email }
    });
    res.json({ student: updatedStudent });
  } catch (err) {
    next(err);
  }
});

// DELETE student (protected)
router.delete("/:id", auth, async (req, res, next) => {
  try {
    await prisma.student.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ message: "Student deleted" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;