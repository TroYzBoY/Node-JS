const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

// Logger middleware (Challenge 2)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    console.log(`[GATEWAY] ${req.method} ${req.originalUrl} ${res.statusCode} - ${ms}ms`);
  });
  next();
});

const BOOK_URL = process.env.BOOK_URL || 'http://localhost:4001';
const USER_URL = process.env.USER_URL || 'http://localhost:4002';
const BORROW_URL = process.env.BORROW_URL || 'http://localhost:4003';

function proxyTo(targetBase) {
  return async (req, res) => {
    try {
      const url = `${targetBase}${req.originalUrl}`;
      const options = {
        method: req.method,
        headers: { 'Content-Type': 'application/json' }
      };
      if (!['GET', 'HEAD'].includes(req.method)) {
        options.body = JSON.stringify(req.body || {});
      }

      const upstream = await fetch(url, options);
      const contentType = upstream.headers.get('content-type') || '';
      const status = upstream.status;

      if (contentType.includes('application/json')) {
        const data = await upstream.json();
        res.status(status).json(data);
      } else {
        const text = await upstream.text();
        res.status(status).send(text);
      }
    } catch (err) {
      res.status(502).json({ message: 'Gateway error', detail: err.message || 'Upstream unreachable' });
    }
  };
}

app.use('/books', proxyTo(BOOK_URL));
app.use('/users', proxyTo(USER_URL));
app.use(['/borrow', '/return', '/borrows'], proxyTo(BORROW_URL));

app.get('/', (req, res) => {
  res.json({ message: 'Library API Gateway' });
});

const PORT = process.env.GATEWAY_PORT || 3000;
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
