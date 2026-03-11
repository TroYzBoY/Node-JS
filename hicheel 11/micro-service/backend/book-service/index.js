const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const { getPrisma } = require('../prisma/client');

dotenv.config();

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/books', async (req, res) => {
  const prisma = getPrisma();
  const books = await prisma.book.findMany({ orderBy: { id: 'asc' } });
  res.json(books);
});

app.get('/books/:id', async (req, res) => {
  const prisma = getPrisma();
  const id = Number(req.params.id);
  const book = await prisma.book.findUnique({ where: { id } });
  if (!book) return res.status(404).json({ message: 'Book not found' });
  res.json(book);
});

app.post('/books', async (req, res) => {
  const prisma = getPrisma();
  const data = req.body || {};
  const book = await prisma.book.create({
    data: {
      title: data.title || 'Untitled',
      author: data.author || 'Unknown',
      available: data.available !== undefined ? !!data.available : true
    }
  });
  res.status(201).json(book);
});

app.delete('/books/:id', async (req, res) => {
  const prisma = getPrisma();
  const id = Number(req.params.id);
  try {
    const removed = await prisma.book.delete({ where: { id } });
    res.json(removed);
  } catch (_) {
    res.status(404).json({ message: 'Book not found' });
  }
});

// Internal endpoint for borrow-service
app.put('/books/:id/availability', async (req, res) => {
  const prisma = getPrisma();
  const id = Number(req.params.id);
  try {
    const book = await prisma.book.update({
      where: { id },
      data: { available: !!req.body.available }
    });
    res.json(book);
  } catch (_) {
    res.status(404).json({ message: 'Book not found' });
  }
});

const PORT = process.env.BOOK_PORT || 4001;
app.listen(PORT, () => {
  console.log(`Book service running on port ${PORT}`);
});
