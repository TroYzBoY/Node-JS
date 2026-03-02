const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { getPrismaClient } = require('../prisma/client');

// Task 2: Advanced filtering, pagination, sorting
exports.getUsers = catchAsync(async (req, res, next) => {
  const prisma = getPrismaClient();
  const { role, sort = 'createdAt', page = 1, limit = 10, search } = req.query;

  const where = {};
  if (role) where.role = role;
  if (search) where.OR = [
    { username: { contains: search, mode: 'insensitive' } },
    { email: { contains: search, mode: 'insensitive' } },
  ];

  const allowedSorts = ['createdAt', 'username', 'email'];
  const orderBy = allowedSorts.includes(sort) ? { [sort]: 'asc' } : { createdAt: 'asc' };

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const [users, total] = await Promise.all([
    prisma.user.findMany({ where, orderBy, skip, take, select: { id: true, email: true, username: true, role: true, createdAt: true } }),
    prisma.user.count({ where }),
  ]);

  res.json({
    status: 'success',
    results: users.length,
    pagination: { total, page: Number(page), limit: take, pages: Math.ceil(total / take) },
    data: { users },
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const prisma = getPrismaClient();
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: { id: true, email: true, username: true, role: true, createdAt: true, profile: true },
  });
  if (!user) return next(new AppError('No user found with that ID.', 404));
  res.json({ status: 'success', data: { user } });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const prisma = getPrismaClient();
  const { password, ...updateData } = req.body;
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: updateData,
    select: { id: true, email: true, username: true, role: true },
  });
  res.json({ status: 'success', data: { user } });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const prisma = getPrismaClient();
  await prisma.user.delete({ where: { id: req.params.id } });
  res.status(204).json({ status: 'success', data: null });
});
