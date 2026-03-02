module.exports = function validateUser(req, res, next) {
  const { username, password } = req.body;

  if (!username || !password) {
    const err = new Error("Username and password required");
    err.status = 400;
    return next(err);
  }

  next();
};