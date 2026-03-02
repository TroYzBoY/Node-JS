import { Router } from "express";
import { createStudent, deleteStudent, listStudents } from "../controllers/student.controller.js";
import protect from "../middleware/protect.js";
import { authorize } from "../middleware/authorize.js";

const router = Router();

router.use(protect);

router.get("/", listStudents);
router.post("/", authorize("ADMIN", "TEACHER"), createStudent);
router.delete("/:id", authorize("ADMIN"), deleteStudent);

export default router;