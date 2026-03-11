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

const BOOK_URL = process.env.BOOK_URL || 'http://localhost:4001';
const USER_URL = process.env.USER_URL || 'http://localhost:4002';

async function httpJson(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) {
    let msg = res.statusText;
    try {
      const data = await res.json();
      if (data && data.message) msg = data.message;
    } catch (_) {
      // ignore
    }
    throw { status: res.status, message: msg };
  }
  if (res.status === 204) return null;
  return res.json();
}

app.get('/borrows', async (req, res) => {
  const prisma = getPrisma();
  const borrows = await prisma.borrow.findMany({ orderBy: { id: 'asc' } });
  res.json(borrows);
});

app.post('/borrow', async (req, res) => {
  try {
    const prisma = getPrisma();
    const { userId, bookId } = req.body || {};
    if (!userId || !bookId) return res.status(400).json({ message: 'userId and bookId are required' });

    const user = await httpJson(`${USER_URL}/users/${userId}`);
    if (!user) throw { status: 404, message: 'User not found' };

    const book = await httpJson(`${BOOK_URL}/books/${bookId}`);
    if (!book) throw { status: 404, message: 'Book not found' };

    if (!book.available) return res.status(400).json({ message: 'Book not available' });

    const activeCount = await prisma.borrow.count({
      where: { userId, active: true }
    });
    if (activeCount >= 3) return res.status(400).json({ message: 'User borrow limit reached (max 3)' });

    const borrow = await prisma.borrow.create({
      data: { userId, bookId }
    });

    await httpJson(`${BOOK_URL}/books/${bookId}/availability`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ available: false })
    });

    res.status(201).json(borrow);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Server error' });
  }
});

app.post('/return', async (req, res) => {
  try {
    const prisma = getPrisma();
    const { borrowId } = req.body || {};
    if (!borrowId) return res.status(400).json({ message: 'borrowId is required' });

    const borrow = await prisma.borrow.findUnique({ where: { id: borrowId } });
    if (!borrow) return res.status(404).json({ message: 'Borrow record not found' });
    if (!borrow.active) return res.status(400).json({ message: 'Borrow already returned' });

    const updated = await prisma.borrow.update({
      where: { id: borrowId },
      data: { active: false, returnedAt: new Date() }
    });

    await httpJson(`${BOOK_URL}/books/${borrow.bookId}/availability`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ available: true })
    });

    res.json(updated);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Server error' });
  }
});

const PORT = process.env.BORROW_PORT || 4003;
app.listen(PORT, () => {
  console.log(`Borrow service running on port ${PORT}`);
});
