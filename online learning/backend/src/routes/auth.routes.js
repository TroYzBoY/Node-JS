const express = require("express");
const { body } = require("express-validator");
const { PrismaClient } = require("@prisma/client");
const handleValidationErrors = require("../middleware/handleValidationErrors");
const catchAsync = require("../middleware/catchAsync");
const AppError = require("../utils/AppError");

const router = express.Router();
const prisma = new PrismaClient();

router.post(
  "/register",
  body("name").optional().isLength({ min: 2 }).withMessage("Name must be at least 2 characters"),
  body("email").isEmail().withMessage("Email is invalid"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  handleValidationErrors,
  catchAsync(async (req, res) => {
    const { name, email } = req.body;

    const derivedName = (name || email.split("@")[0]).trim();

    try {
      const student = await prisma.student.create({
        data: {
          name: derivedName,
          email,
          age: null,
        },
      });

      res.status(200).json({
        success: true,
        message: "Registration successful",
        data: {
          id: student.id,
          name: student.name,
          email: student.email,
        },
      });
    } catch (error) {
      if (error.code === "P2002") {
        throw new AppError("Email already exists", 400);
      }
      throw error;
    }
  }),
);

router.post(
  "/login",
  body("email").isEmail().withMessage("Email is invalid"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  handleValidationErrors,
  catchAsync(async (req, res) => {
    const { email } = req.body;
    const student = await prisma.student.findUnique({
      where: { email },
    });

    if (!student) {
      throw new AppError("Invalid email or password", 400);
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        id: student.id,
        name: student.name,
        email: student.email,
      },
    });
  }),
);

module.exports = router;
