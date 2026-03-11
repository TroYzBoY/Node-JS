const userService = require('../services/user.service');

async function list(req, res) {
  const data = await userService.listUsers();
  res.json(data);
}

async function create(req, res) {
  const user = await userService.createUser(req.body || {});
  res.status(201).json(user);
}

module.exports = {
  list,
  create
};
