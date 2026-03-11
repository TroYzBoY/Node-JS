const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

dotenv.config();

const bookRoutes = require('./routes/book.routes');
const userRoutes = require('./routes/user.routes');
const borrowRoutes = require('./routes/borrow.routes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Simple logger middleware (Challenge 1)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    console.log(`[MONOLITH] ${req.method} ${req.originalUrl} ${res.statusCode} - ${ms}ms`);
  });
  next();
});

app.use('/books', bookRoutes);
app.use('/users', userRoutes);
app.use('/', borrowRoutes); // /borrow, /return, /stats

app.get('/', (req, res) => {
  res.json({ message: 'Library Monolith API' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Monolith server running on port ${PORT}`);
});
