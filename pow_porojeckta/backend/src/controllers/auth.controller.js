const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { getPrismaClient } = require('../prisma/client');

const signToken = (payload) => jwt.sign(payload, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });

exports.register = catchAsync(async (req, res, next) => {
  const prisma = getPrismaClient();
  const { email, password, username } = req.body;
  const hashedPassword = await bcrypt.hash(password, 12);

  // Task 8: Transaction - create User + Profile atomically
  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { email, password: hashedPassword, username, role: 'USER' },
    });
    const profile = await tx.profile.create({
      data: { userId: user.id, bio: '' },
    });
    return { user, profile };
  });

  const token = signToken({ id: result.user.id, role: result.user.role });
  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: { id: result.user.id, email: result.user.email, username: result.user.username, role: result.user.role },
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const prisma = getPrismaClient();
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new AppError('Invalid email or password.', 401));
  }

  const token = signToken({ id: user.id, role: user.role });
  res.json({
    status: 'success',
    token,
    data: { user: { id: user.id, email: user.email, username: user.username, role: user.role } },
  });
});
