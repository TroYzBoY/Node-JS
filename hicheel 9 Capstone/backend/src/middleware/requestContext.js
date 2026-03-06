const crypto = require("crypto");

const requestContext = (req, res, next) => {
  req.requestId = crypto.randomUUID();
  req.requestStart = Date.now();
  res.setHeader("X-Request-Id", req.requestId);
  next();
};

module.exports = {
  requestContext,
};
