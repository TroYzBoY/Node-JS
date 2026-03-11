const bookService = require('../services/book.service');

async function list(req, res) {
  const data = await bookService.listBooks();
  res.json(data);
}

async function create(req, res) {
  const book = await bookService.createBook(req.body || {});
  res.status(201).json(book);
}

async function remove(req, res) {
  const id = Number(req.params.id);
  const removed = await bookService.deleteBook(id);
  if (!removed) return res.status(404).json({ message: 'Book not found' });
  res.json(removed);
}

module.exports = {
  list,
  create,
  remove
};
