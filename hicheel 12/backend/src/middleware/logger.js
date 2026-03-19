function logger(req, _res, next) {
  const startedAt = Date.now();
  const { method, originalUrl } = req;
  _res.on("finish", () => {
    const ms = Date.now() - startedAt;
    console.log(`[${new Date().toISOString()}] ${method} ${originalUrl} - ${ms}ms`);
  });

  next();
}

module.exports = logger;
