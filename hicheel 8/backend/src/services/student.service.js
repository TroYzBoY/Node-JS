import { AppError } from "../errors/AppError.js";
import { studentRepository } from "../repositories/student.repository.js";
import { toStudentResponseDTO } from "../dtos/student.dto.js";

export const studentService = {
  async listStudents() {
    const students = await studentRepository.findAll();
    return students.map(toStudentResponseDTO);
  },

  async registerStudent(data) {
    if (!Number.isFinite(data.gpa)) {
      throw new AppError("GPA must be a number", 400);
    }

    if (data.gpa < 0 || data.gpa > 4) {
      throw new AppError("GPA must be between 0 and 4", 400);
    }

    const existingStudent = await studentRepository.findByEmail(data.email);
    if (existingStudent) {
      throw new AppError("Email already exists", 409);
    }

    const created = await studentRepository.create(data);
    return toStudentResponseDTO(created);
  },

  async removeStudent(id) {
    const student = await studentRepository.findById(id);
    if (!student) {
      throw new AppError("Student not found", 404);
    }

    await studentRepository.deleteById(id);
    return { message: "Student deleted" };
  },
};
