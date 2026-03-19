const express = require("express");
const cors = require("cors");
const logger = require("./middleware/logger");
const authRoutes = require("./routes/auth");
const studentRoutes = require("./routes/students");

const app = express();

app.use(cors());
app.use(express.json());
app.use(logger);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.use("/api", authRoutes);
app.use("/api", studentRoutes);

module.exports = app;
