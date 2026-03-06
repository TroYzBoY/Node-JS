const logger = require("../utils/logger");

const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Not Found - ${req.originalUrl}`,
    requestId: req.requestId || null,
  });
};

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  logger.error({
    message,
    statusCode,
    path: req.originalUrl,
    method: req.method,
    requestId: req.requestId,
    stack: err.stack,
  });

  res.status(statusCode).json({
    success: false,
    message,
    requestId: req.requestId || null,
  });
};

module.exports = {
  notFound,
  errorHandler,
};
