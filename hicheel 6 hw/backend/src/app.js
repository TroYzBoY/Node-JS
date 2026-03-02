const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const studentRoutes = require('./routes/student.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).send('API OK');
});

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);

app.use((err, req, res, next) => {
  const message = err?.message || 'Internal Server Error';
  res.status(500).json({ message });
});

module.exports = app;
