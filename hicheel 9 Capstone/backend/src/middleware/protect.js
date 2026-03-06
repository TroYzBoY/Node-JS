const jwt = require("jsonwebtoken");
const prisma = require("../prisma/client");
const { createError } = require("../utils/errors");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return next(createError(401, "Unauthorized"));
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return next(createError(500, "JWT secret is not configured"));
    }

    const decoded = jwt.verify(token, secret);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true, role: true, provider: true, createdAt: true },
    });

    if (!user) {
      return next(createError(401, "Unauthorized"));
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(createError(401, "Unauthorized"));
  }
};

module.exports = {
  protect,
};
