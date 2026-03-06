const bcrypt = require("bcryptjs");
const prisma = require("../prisma/client");
const { signToken } = require("../utils/jwt");
const { createError } = require("../utils/errors");

const allowedRoles = ["ADMIN", "SELLER", "CUSTOMER"];

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  provider: user.provider,
  createdAt: user.createdAt,
});

const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return next(createError(400, "name, email, password are required"));
    }

    if (password.length < 8) {
      return next(createError(400, "Password must be at least 8 characters"));
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      return next(createError(409, "Email already exists"));
    }

    const safeRole = role && allowedRoles.includes(role) ? role : "CUSTOMER";
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: String(name).trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: safeRole,
        provider: "LOCAL",
      },
    });

    const token = signToken({ userId: user.id, role: user.role });

    return res.status(201).json({
      success: true,
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(createError(400, "email and password are required"));
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user || !user.password) {
      return next(createError(401, "Invalid credentials"));
    }

    const passwordMatched = await bcrypt.compare(password, user.password);
    if (!passwordMatched) {
      return next(createError(401, "Invalid credentials"));
    }

    const token = signToken({ userId: user.id, role: user.role });

    return res.status(200).json({
      success: true,
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return next(error);
  }
};

const me = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
};

const googleCallback = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(createError(401, "Google authentication failed"));
    }

    const token = signToken({ userId: req.user.id, role: req.user.role });
    const safeUser = sanitizeUser(req.user);
    const frontendUrl = process.env.FRONTEND_URL;

    if (frontendUrl) {
      const redirectUrl = `${frontendUrl}?token=${encodeURIComponent(token)}`;
      return res.redirect(redirectUrl);
    }

    return res.status(200).json({
      success: true,
      token,
      user: safeUser,
    });
  } catch (error) {
    return next(error);
  }
};

const googleFailed = (req, res) => {
  return res.status(401).json({
    success: false,
    message: "Google authentication failed",
  });
};

module.exports = {
  register,
  login,
  me,
  googleCallback,
  googleFailed,
};
