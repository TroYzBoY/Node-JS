const borrowRepo = require('../repositories/borrow.repository');
const userService = require('./user.service');
const bookService = require('./book.service');

async function borrowBook({ userId, bookId }) {
  const user = await userService.getUser(userId);
  if (!user) throw { status: 404, message: 'User not found' };

  const book = await bookService.getBook(bookId);
  if (!book) throw { status: 404, message: 'Book not found' };

  if (!book.available) throw { status: 400, message: 'Book not available' };

  const active = await borrowRepo.listActiveByUserId(userId);
  if (active.length >= 3) throw { status: 400, message: 'User borrow limit reached (max 3)' };

  const borrow = await borrowRepo.createBorrow({ userId, bookId });
  await bookService.setAvailability(bookId, false);
  return borrow;
}

async function returnBook({ borrowId }) {
  const borrow = await borrowRepo.findBorrowById(borrowId);
  if (!borrow) throw { status: 404, message: 'Borrow record not found' };
  if (!borrow.active) throw { status: 400, message: 'Borrow already returned' };

  const updated = await borrowRepo.returnBorrow(borrowId);
  await bookService.setAvailability(borrow.bookId, true);
  return updated;
}

async function listBorrows() {
  return borrowRepo.listBorrows();
}

module.exports = {
  borrowBook,
  returnBook,
  listBorrows
};
