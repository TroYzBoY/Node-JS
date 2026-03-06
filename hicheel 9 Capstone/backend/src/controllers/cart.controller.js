const prisma = require("../prisma/client");
const { createError } = require("../utils/errors");

const toPlainCart = (cart) => {
  if (!cart) return null;
  return {
    ...cart,
    items: cart.items.map((item) => ({
      ...item,
      product: {
        ...item.product,
        price: Number(item.product.price),
      },
    })),
  };
};

const getOrCreateCart = async (userId) => {
  const existing = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              stock: true,
            },
          },
        },
      },
    },
  });

  if (existing) return existing;

  return prisma.cart.create({
    data: { userId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              stock: true,
            },
          },
        },
      },
    },
  });
};

const getMyCart = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    return res.status(200).json({
      success: true,
      data: toPlainCart(cart),
    });
  } catch (error) {
    return next(error);
  }
};

const addToCart = async (req, res, next) => {
  try {
    const productId = Number(req.body.productId);
    const quantity = Number(req.body.quantity);

    if (!Number.isInteger(productId) || productId <= 0) {
      return next(createError(400, "productId must be a positive integer"));
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return next(createError(400, "quantity must be a positive integer"));
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return next(createError(404, "Product not found"));
    }

    const cart = await getOrCreateCart(req.user.id);
    const existing = cart.items.find((item) => item.productId === productId);
    const nextQty = (existing?.quantity || 0) + quantity;

    if (nextQty > product.stock) {
      return next(createError(409, "Insufficient stock"));
    }

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: nextQty },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
      });
    }

    const updatedCart = await getOrCreateCart(req.user.id);
    return res.status(200).json({
      success: true,
      data: toPlainCart(updatedCart),
    });
  } catch (error) {
    return next(error);
  }
};

const updateCartItem = async (req, res, next) => {
  try {
    const cartItemId = Number(req.params.id);
    const quantity = Number(req.body.quantity);

    if (!Number.isInteger(cartItemId) || cartItemId <= 0) {
      return next(createError(400, "Invalid cart item id"));
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return next(createError(400, "quantity must be a positive integer"));
    }

    const cart = await getOrCreateCart(req.user.id);
    const item = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { product: true },
    });

    if (!item || item.cartId !== cart.id) {
      return next(createError(404, "Cart item not found"));
    }

    if (quantity > item.product.stock) {
      return next(createError(409, "Insufficient stock"));
    }

    await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    });

    const updatedCart = await getOrCreateCart(req.user.id);
    return res.status(200).json({
      success: true,
      data: toPlainCart(updatedCart),
    });
  } catch (error) {
    return next(error);
  }
};

const deleteCartItem = async (req, res, next) => {
  try {
    const cartItemId = Number(req.params.id);
    if (!Number.isInteger(cartItemId) || cartItemId <= 0) {
      return next(createError(400, "Invalid cart item id"));
    }

    const cart = await getOrCreateCart(req.user.id);
    const item = await prisma.cartItem.findUnique({ where: { id: cartItemId } });

    if (!item || item.cartId !== cart.id) {
      return next(createError(404, "Cart item not found"));
    }

    await prisma.cartItem.delete({ where: { id: cartItemId } });

    const updatedCart = await getOrCreateCart(req.user.id);
    return res.status(200).json({
      success: true,
      data: toPlainCart(updatedCart),
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getMyCart,
  addToCart,
  updateCartItem,
  deleteCartItem,
};

