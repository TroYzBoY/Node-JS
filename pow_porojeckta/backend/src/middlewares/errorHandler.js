const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

// Prisma error mapping
const handlePrismaError = (err) => {
  switch (err.code) {
    case 'P2002':
      return new AppError(`Duplicate field: ${err.meta?.target?.join(', ')}. Please use another value.`, 400);
    case 'P2014':
      return new AppError('Invalid ID provided.', 400);
    case 'P2003':
      return new AppError('Foreign key constraint failed.', 400);
    case 'P2025':
      return new AppError('Record not found.', 404);
    default:
      return new AppError('Database error occurred.', 500);
  }
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    logger.error('PROGRAMMING ERROR', { error: err.message, stack: err.stack });
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
    });
  }
};

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log all errors
  logger.error(err.message, {
    statusCode: err.statusCode,
    path: req.path,
    method: req.method,
    isOperational: err.isOperational,
  });

  let error = { ...err, message: err.message };

  // Prisma errors
  if (err.code?.startsWith('P')) error = handlePrismaError(err);

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

const notFound = (req, res, next) => {
  next(new AppError(`Cannot find ${req.method} ${req.originalUrl} on this server.`, 404));
};

module.exports = { globalErrorHandler, notFound };
