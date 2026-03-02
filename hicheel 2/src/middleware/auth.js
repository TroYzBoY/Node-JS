const REQUIRED_TOKEN = process.env.API_TOKEN;

module.exports = function auth(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = header.substring(7);

  if (token !== REQUIRED_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  req.user = {
    username: "ervvgiinUser",
    role: "admin"
  };

  next();
};