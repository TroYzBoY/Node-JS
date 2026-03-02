const prisma = require('../config/prisma');

const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
};

const findUserByEmail = (email) => prisma.user.findUnique({ where: { email } });

const createUser = (data) => prisma.user.create({ data });

const findUserById = (id) => prisma.user.findUnique({ where: { id } });

const listStudents = () =>
  prisma.user.findMany({
    where: { role: { in: ['STUDENT'] } },
    orderBy: { createdAt: 'desc' },
  });

const deleteStudentById = (id) => prisma.user.delete({ where: { id } });

const findStudentById = (id) =>
  prisma.user.findFirst({
    where: {
      id,
      role: 'STUDENT',
    },
  });

module.exports = {
  sanitizeUser,
  findUserByEmail,
  createUser,
  findUserById,
  listStudents,
  deleteStudentById,
  findStudentById,
};
