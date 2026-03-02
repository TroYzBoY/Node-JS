require('dotenv').config();
const app = require('./app');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`, { env: process.env.NODE_ENV || 'development' });
});

process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION', { error: err.message });
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION', { error: err.message });
  process.exit(1);
});
