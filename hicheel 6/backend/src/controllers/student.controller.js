import { prisma } from "../prisma.js";

export async function listStudents(req, res) {
  const students = await prisma.student.findMany({
    orderBy: { createdAt: "desc" },
  });

  res.json(students);
}

export async function createStudent(req, res) {
  const { grade } = req.body;

  if (grade === undefined || grade === null || String(grade).trim() === "") {
    return res.status(400).json({ message: "grade is required" });
  }

  const student = await prisma.student.create({
    data: { grade: String(grade) },
  });

  res.status(201).json(student);
}

export async function deleteStudent(req, res) {
  const { id } = req.params;

  try {
    await prisma.student.delete({ where: { id } });
    return res.status(204).send();
  } catch (err) {
    if (err?.code === "P2025") {
      return res.status(404).json({ message: "student not found" });
    }
    throw err;
  }
}