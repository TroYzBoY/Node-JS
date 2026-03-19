const { validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

module.exports = function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const first = errors.array()[0];
    return next(new AppError(first.msg || 'Validation error', 400));
  }

  next();
};