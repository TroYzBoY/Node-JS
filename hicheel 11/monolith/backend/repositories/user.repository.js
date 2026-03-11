const { getPrisma } = require('../prisma/client');

async function listUsers() {
  const prisma = getPrisma();
  return prisma.user.findMany({ orderBy: { id: 'asc' } });
}

async function createUser(data) {
  const prisma = getPrisma();
  return prisma.user.create({
    data: {
      name: data.name || 'Unnamed'
    }
  });
}

async function findUserById(id) {
  const prisma = getPrisma();
  return prisma.user.findUnique({ where: { id } });
}

module.exports = {
  listUsers,
  createUser,
  findUserById
};
