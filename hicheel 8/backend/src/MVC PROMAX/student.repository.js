import prisma from "../prisma/client.js";

export const studentRepository = {
  findAll() {
    return prisma.student.findMany({
      orderBy: { id: "asc" },
    });
  },

  findById(id) {
    return prisma.student.findUnique({
      where: { id },
    });
  },

  findByEmail(email) {
    return prisma.student.findUnique({
      where: { email },
    });
  },

  create(data) {
    return prisma.student.create({
      data,
    });
  },

  async deleteById(id) {
    const result = await prisma.student.deleteMany({
      where: { id },
    });
    return result.count > 0;
  },
};
