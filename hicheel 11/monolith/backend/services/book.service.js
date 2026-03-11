const bookRepo = require('../repositories/book.repository');

async function listBooks() {
  return bookRepo.listBooks();
}

async function createBook(data) {
  return bookRepo.createBook(data);
}

async function deleteBook(id) {
  return bookRepo.removeBook(id);
}

async function getBook(id) {
  return bookRepo.findBookById(id);
}

async function setAvailability(id, available) {
  return bookRepo.setBookAvailability(id, available);
}

async function getStats() {
  return bookRepo.countStats();
}

module.exports = {
  listBooks,
  createBook,
  deleteBook,
  getBook,
  setAvailability,
  getStats
};
