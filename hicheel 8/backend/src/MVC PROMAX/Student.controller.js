import { studentService } from "./Student.service.js";
import { CreateStudentDTO } from "./Student.dto.js";

export const studentController = {
  getAll(req, res) {
    try {
      const minGpaRaw = req.query.minGpa;
      let minGpa;

      if (minGpaRaw !== undefined) {
        minGpa = Number(minGpaRaw);
        if (Number.isNaN(minGpa)) {
          return res.status(400).json({ error: "minGpa too baih yostoi" });
        }
      }

      const students = studentService.getAllStudents(minGpa);
      res.status(200).json(students);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  create(req, res) {
    try {
      const dto = CreateStudentDTO(req.body);
      const student = studentService.createStudent(dto);
      res.status(201).json(student);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  delete(req, res) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({ error: "ID too baih yostoi" });
      }

      const result = studentService.deleteStudent(id);
      res.status(200).json(result);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },
};
