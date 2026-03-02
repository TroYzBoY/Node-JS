const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const { globalErrorHandler, notFound } = require('./middlewares/errorHandler');
const routes = require('./routes');

const app = express();

// Task 3: Security & Built-in Middleware
app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') || '*' }));

// Rate limiting (bonus)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { status: 'fail', message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// Body parsing with size limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(express.raw({ type: 'application/octet-stream', limit: '1mb' }));

// Serve React build if available
const frontendDistPath = path.join(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
}

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// API routes
app.use('/api', routes);

if (fs.existsSync(frontendDistPath)) {
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) return res.status(404).end();
    return res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

// 404 handler
app.use(notFound);

// Global error handler (must be last)
app.use(globalErrorHandler);

module.exports = app;
