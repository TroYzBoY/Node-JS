const AppError = require('../utils/AppError');

function sendDev(err, res) {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message,
    statusCode: err.statusCode || 500,
    stack: err.stack,
  });
}

function sendProd(err, res) {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  console.error('UNEXPECTED ERROR:', err);

  return res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
}

module.exports = function errorHandler(err, req, res, next) {
  if (!err.statusCode) err.statusCode = 500;

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    err = new AppError('Invalid JSON body', 400);
  }

  if (process.env.NODE_ENV === 'development') {
    return sendDev(err, res);
  }

  sendProd(err, res);
};
