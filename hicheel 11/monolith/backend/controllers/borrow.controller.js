const borrowService = require('../services/borrow.service');
const bookService = require('../services/book.service');

async function borrow(req, res) {
  try {
    const borrow = await borrowService.borrowBook(req.body || {});
    res.status(201).json(borrow);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Server error' });
  }
}

async function returnBook(req, res) {
  try {
    const updated = await borrowService.returnBook(req.body || {});
    res.json(updated);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Server error' });
  }
}

async function stats(req, res) {
  const data = await bookService.getStats();
  res.json(data);
}

module.exports = {
  borrow,
  returnBook,
  stats
};
