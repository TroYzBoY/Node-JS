import express from "express";
import { studentController } from "./controllers/student.controller.js";
import { AppError } from "./errors/AppError.js";

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ ok: true });
});

app.get("/students", studentController.getAll);
app.post("/students", studentController.create);
app.delete("/students/:id", studentController.delete);

app.use((req, res, next) => {
  next(new AppError("Route not found", 404));
});

app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";
  res.status(statusCode).json({ message, statusCode });
});

export default app;
