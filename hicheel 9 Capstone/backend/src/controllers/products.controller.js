const prisma = require("../prisma/client");
const { createError } = require("../utils/errors");

const parseProduct = (product) => ({
  ...product,
  price: Number(product.price),
});

const getProducts = async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: { select: { id: true, name: true } },
        seller: { select: { id: true, name: true, email: true } },
      },
      orderBy: { id: "desc" },
    });

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products.map(parseProduct),
    });
  } catch (error) {
    return next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return next(createError(400, "Invalid product id"));
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true } },
        seller: { select: { id: true, name: true, email: true } },
      },
    });

    if (!product) {
      return next(createError(404, "Product not found"));
    }

    return res.status(200).json({
      success: true,
      data: parseProduct(product),
    });
  } catch (error) {
    return next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, stock, categoryId, sellerId } = req.body;

    const category = await prisma.category.findUnique({ where: { id: Number(categoryId) } });
    if (!category) {
      return next(createError(404, "Category not found"));
    }

    const ownerId = req.user.role === "ADMIN" && sellerId ? Number(sellerId) : req.user.id;

    if (!Number.isInteger(ownerId) || ownerId <= 0) {
      return next(createError(400, "Invalid sellerId"));
    }

    const seller = await prisma.user.findUnique({ where: { id: ownerId } });
    if (!seller || (seller.role !== "SELLER" && seller.role !== "ADMIN")) {
      return next(createError(400, "sellerId must belong to a seller/admin user"));
    }

    const created = await prisma.product.create({
      data: {
        name: String(name).trim(),
        description: description ? String(description).trim() : null,
        price: Number(price),
        stock: Number(stock),
        categoryId: Number(categoryId),
        sellerId: ownerId,
      },
      include: {
        category: { select: { id: true, name: true } },
        seller: { select: { id: true, name: true, email: true } },
      },
    });

    return res.status(201).json({
      success: true,
      data: parseProduct(created),
    });
  } catch (error) {
    return next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return next(createError(400, "Invalid product id"));
    }

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return next(createError(404, "Product not found"));
    }

    if (req.user.role === "SELLER" && existing.sellerId !== req.user.id) {
      return next(createError(403, "Forbidden"));
    }

    if (req.body.categoryId !== undefined) {
      const category = await prisma.category.findUnique({ where: { id: Number(req.body.categoryId) } });
      if (!category) {
        return next(createError(404, "Category not found"));
      }
    }

    const updateData = {};
    if (req.body.name !== undefined) updateData.name = String(req.body.name).trim();
    if (req.body.description !== undefined) updateData.description = req.body.description ? String(req.body.description).trim() : null;
    if (req.body.price !== undefined) updateData.price = Number(req.body.price);
    if (req.body.stock !== undefined) updateData.stock = Number(req.body.stock);
    if (req.body.categoryId !== undefined) updateData.categoryId = Number(req.body.categoryId);

    const updated = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: { select: { id: true, name: true } },
        seller: { select: { id: true, name: true, email: true } },
      },
    });

    return res.status(200).json({
      success: true,
      data: parseProduct(updated),
    });
  } catch (error) {
    return next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return next(createError(400, "Invalid product id"));
    }

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return next(createError(404, "Product not found"));
    }

    if (req.user.role === "SELLER" && existing.sellerId !== req.user.id) {
      return next(createError(403, "Forbidden"));
    }

    await prisma.product.delete({ where: { id } });

    return res.status(200).json({
      success: true,
      message: "Product deleted",
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
