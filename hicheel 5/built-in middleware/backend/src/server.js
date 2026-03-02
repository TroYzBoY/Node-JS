const express = require('express');
const app = express();

// 🔹 Built-in middleware
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// 🔹 Routes
const profileRoutes = require('../routes/profile.routes');
const authRoutes = require('../routes/auth.routes');

app.use('/api', profileRoutes);
app.use('/form', authRoutes);

// 🔹 Root
app.get('/', (req, res) => {
  res.send('Server ажиллаж байна 🚀');
});

// 🔹 Error middleware (хамгийн сүүлд)
const errorHandler = require('./middleware/err.middleware');
app.use(errorHandler);

app.listen(3000, () => {
  console.log('http://localhost:3000 дээр аслаа');
});
