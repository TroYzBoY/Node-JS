const bcrypt = require('bcryptjs');
const { signToken } = require('../config/jwt');
const {
  sanitizeUser,
  findUserByEmail,
  createUser,
  findUserById,
} = require('./user.service');

const getBcryptRounds = () => {
  const value = Number(process.env.BCRYPT_ROUNDS);
  return Number.isFinite(value) && value > 0 ? value : 12;
};

const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'name, email, password are required' });
  }

  const existed = await findUserByEmail(email);
  if (existed) {
    return res.status(409).json({ message: 'Email already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, getBcryptRounds());
  const user = await createUser({
    name,
    email,
    password: hashedPassword,
    role: role || 'STUDENT',
  });

  const token = signToken({ id: user.id, role: user.role, email: user.email });

  return res.status(201).json({
    token,
    user: sanitizeUser(user),
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required' });
  }

  const user = await findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const token = signToken({ id: user.id, role: user.role, email: user.email });

  return res.status(200).json({
    token,
    user: sanitizeUser(user),
  });
};

const me = async (req, res) => {
  const user = await findUserById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  return res.status(200).json({ user: sanitizeUser(user) });
};

module.exports = {
  register,
  login,
  me,
};
