const prisma = require("../prisma/client");
const { createError } = require("../utils/errors");

const getCategories = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { id: "desc" },
    });

    return res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    return next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return next(createError(400, "name is required"));
    }

    const categoryName = name.trim();
    const existing = await prisma.category.findUnique({ where: { name: categoryName } });
    if (existing) {
      return next(createError(409, "Category already exists"));
    }

    const category = await prisma.category.create({
      data: { name: categoryName },
    });

    return res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getCategories,
  createCategory,
};

