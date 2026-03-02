// src/middlewares/index.js
// ============================================================
// TASK 1 — notFound middleware
// TASK 3 — Security middleware setup (CORS, Helmet, Rate limit)
// ============================================================

const rateLimit = require('express-rate-limit');
const helmet    = require('helmet');
const cors      = require('cors');
const AppError  = require('../utils/AppError');

// ── 404 handler — must be registered AFTER all routes ─────
const notFound = (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found.`, 404));
};

// ── CORS ──────────────────────────────────────────────────
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') ?? '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

// ── Rate limiter (TASK 3 Bonus) ────────────────────────────
const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '900000'), // 15 min
  max:      parseInt(process.env.RATE_LIMIT_MAX        ?? '100'),
  standardHeaders: true,
  legacyHeaders:   false,
  message: { status: 'fail', message: 'Too many requests. Please try again later.' },
});

// Stricter limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10,
  message: { status: 'fail', message: 'Too many login attempts. Try again in 15 minutes.' },
});

module.exports = {
  notFound,
  cors: cors(corsOptions),
  helmet: helmet(),
  globalLimiter,
  authLimiter,
};
