const prisma = require("../prisma/client");
const { createError } = require("../utils/errors");

const allowedOrderStatuses = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"];

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

const getUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        provider: true,
        createdAt: true,
      },
      orderBy: { id: "desc" },
    });

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    return next(error);
  }
};

const getOrders = async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
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

const updateOrderStatus = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      return next(createError(400, "Invalid order id"));
    }

    if (!status || !allowedOrderStatuses.includes(status)) {
      return next(createError(400, "Invalid order status"));
    }

    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) {
      return next(createError(404, "Order not found"));
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status },
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

    return res.status(200).json({
      success: true,
      data: toPlainOrder(updated),
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getUsers,
  getOrders,
  updateOrderStatus,
};

