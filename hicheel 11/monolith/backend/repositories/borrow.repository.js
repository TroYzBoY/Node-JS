const { getPrisma } = require('../prisma/client');

async function listBorrows() {
  const prisma = getPrisma();
  return prisma.borrow.findMany({ orderBy: { id: 'asc' } });
}

async function createBorrow({ userId, bookId }) {
  const prisma = getPrisma();
  return prisma.borrow.create({
    data: { userId, bookId }
  });
}

async function findBorrowById(id) {
  const prisma = getPrisma();
  return prisma.borrow.findUnique({ where: { id } });
}

async function listActiveByUserId(userId) {
  const prisma = getPrisma();
  return prisma.borrow.findMany({
    where: { userId, active: true }
  });
}

async function returnBorrow(id) {
  const prisma = getPrisma();
  try {
    return await prisma.borrow.update({
      where: { id },
      data: { active: false, returnedAt: new Date() }
    });
  } catch (_) {
    return null;
  }
}

module.exports = {
  listBorrows,
  createBorrow,
  findBorrowById,
  listActiveByUserId,
  returnBorrow
};
