// src/utils/prisma.js
// Single Prisma client instance shared across the app.
// Re-using one instance avoids connection pool exhaustion.

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'warn', 'error']
    : ['error'],
});

module.exports = prisma;
