const prisma = require("../prisma/client");
const { createError } = require("../utils/errors");

const toPlainOrder = (order) => ({
  ...order,
  totalPrice: Number(order.totalPrice),
  items: order.items.map((item) => ({
    ...item,
    price: Number(item.price),
    product: item.product
      ? {
          ...item.product,
          price: Number(item.product.price),
        }
      : undefined,
  })),
});

const createOrder = async (req, res, next) => {
  try {
    const createdOrder = await prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { userId: req.user.id },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!cart || cart.items.length === 0) {
        throw createError(400, "Cart is empty");
      }

      for (const item of cart.items) {
        if (item.quantity > item.product.stock) {
          throw createError(409, `Insufficient stock for product: ${item.product.name}`);
        }
      }

      for (const item of cart.items) {
        const updated = await tx.product.updateMany({
          where: {
            id: item.productId,
            stock: { gte: item.quantity },
          },
          data: {
            stock: { decrement: item.quantity },
          },
        });

        if (updated.count === 0) {
          throw createError(409, `Insufficient stock for product: ${item.product.name}`);
        }
      }

      const totalPrice = cart.items.reduce(
        (sum, item) => sum + Number(item.product.price) * item.quantity,
        0,
      );

      const order = await tx.order.create({
        data: {
          userId: req.user.id,
          totalPrice,
          status: "PENDING",
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                },
              },
            },
          },
        },
      });

      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return order;
    });

    return res.status(201).json({
      success: true,
      data: toPlainOrder(createdOrder),
    });
  } catch (error) {
    return next(error);
  }
};

const getMyOrders = async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
          },
        },
      },
      orderBy: { id: "desc" },
    });

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders.map(toPlainOrder),
    });
  } catch (error) {
    return next(error);
  }
};

const getMyOrderById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return next(createError(400, "Invalid order id"));
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return next(createError(404, "Order not found"));
    }

    if (req.user.role !== "ADMIN" && order.userId !== req.user.id) {
      return next(createError(403, "Forbidden"));
    }

    return res.status(200).json({
      success: true,
      data: toPlainOrder(order),
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getMyOrderById,
};

