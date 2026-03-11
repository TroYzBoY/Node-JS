const { getPrisma } = require('../prisma/client');

async function listBooks() {
  const prisma = getPrisma();
  return prisma.book.findMany({ orderBy: { id: 'asc' } });
}

async function createBook(data) {
  const prisma = getPrisma();
  return prisma.book.create({
    data: {
      title: data.title || 'Untitled',
      author: data.author || 'Unknown',
      available: data.available !== undefined ? !!data.available : true
    }
  });
}

async function findBookById(id) {
  const prisma = getPrisma();
  return prisma.book.findUnique({ where: { id } });
}

async function removeBook(id) {
  const prisma = getPrisma();
  try {
    return await prisma.book.delete({ where: { id } });
  } catch (_) {
    return null;
  }
}

async function setBookAvailability(id, available) {
  const prisma = getPrisma();
  try {
    return await prisma.book.update({
      where: { id },
      data: { available: !!available }
    });
  } catch (_) {
    return null;
  }
}

async function countStats() {
  const prisma = getPrisma();
  const [totalBooks, borrowedBooks, availableBooks] = await Promise.all([
    prisma.book.count(),
    prisma.book.count({ where: { available: false } }),
    prisma.book.count({ where: { available: true } })
  ]);
  return { totalBooks, borrowedBooks, availableBooks };
}

module.exports = {
  listBooks,
  createBook,
  findBookById,
  removeBook,
  setBookAvailability,
  countStats
};
