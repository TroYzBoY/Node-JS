import express from "express";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes.js";
import studentRoutes from "./routes/student.routes.js";

export const app = express();

app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Student Management API" });
});

app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "route not found" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "internal server error" });
});