const requests = {};

function rateLimit(req, res, next) {
  const ip = req.ip;
  const now = Date.now();
  const windowTime = 10 * 1000;
  const limit = 3;

  if (!requests[ip]) {
    requests[ip] = [];
  }

  requests[ip] = requests[ip].filter(
    (timestamp) => now - timestamp < windowTime
  );

  if (requests[ip].length >= limit) {
    return res.status(429).json({
      message: "Too many requests. Try again later."
    });
  }

  requests[ip].push(now);
  next();
}

module.exports = rateLimit;