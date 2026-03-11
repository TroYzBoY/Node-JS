const userRepo = require('../repositories/user.repository');

async function listUsers() {
  return userRepo.listUsers();
}

async function createUser(data) {
  return userRepo.createUser(data);
}

async function getUser(id) {
  return userRepo.findUserById(id);
}

module.exports = {
  listUsers,
  createUser,
  getUser
};
