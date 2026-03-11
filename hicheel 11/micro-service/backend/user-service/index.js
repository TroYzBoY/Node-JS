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

app.get('/users', async (req, res) => {
  const prisma = getPrisma();
  const users = await prisma.user.findMany({ orderBy: { id: 'asc' } });
  res.json(users);
});

app.get('/users/:id', async (req, res) => {
  const prisma = getPrisma();
  const id = Number(req.params.id);
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

app.post('/users', async (req, res) => {
  const prisma = getPrisma();
  const data = req.body || {};
  const user = await prisma.user.create({
    data: { name: data.name || 'Unnamed' }
  });
  res.status(201).json(user);
});

const PORT = process.env.USER_PORT || 4002;
app.listen(PORT, () => {
  console.log(`User service running on port ${PORT}`);
});
