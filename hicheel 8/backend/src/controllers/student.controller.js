import { AppError } from "../errors/AppError.js";
import { createStudentDTO } from "../dtos/student.dto.js";
import { studentService } from "../services/student.service.js";

export const studentController = {
  async getAll(req, res, next) {
    try {
      const students = await studentService.listStudents();
      res.status(200).json(students);
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const dto = createStudentDTO(req.body);
      const student = await studentService.registerStudent(dto);
      res.status(201).json(student);
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      const id = Number.parseInt(req.params.id, 10);
      if (Number.isNaN(id)) {
        throw new AppError("Student id must be a number", 400);
      }

      const result = await studentService.removeStudent(id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};
