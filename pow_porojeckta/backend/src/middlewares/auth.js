const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

const requireAuth = catchAsync(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authentication required. Please log in.', 401));
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    req.user = decoded;
    next();
  } catch (err) {
    return next(new AppError('Invalid or expired token.', 401));
  }
});

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return next(new AppError('Authentication required.', 401));
  const expectedRoles = roles.map((r) => String(r).toUpperCase());
  const userRole = String(req.user.role || '').toUpperCase();
  if (!expectedRoles.includes(userRole)) {
    return next(new AppError(`Access denied. Required role: ${roles.join(' or ')}.`, 403));
  }
  next();
};

module.exports = { requireAuth, requireRole };
