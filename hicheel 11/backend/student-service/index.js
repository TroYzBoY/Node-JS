const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 4001;

app.use(cors());
app.use(express.json());

let students = [
  { id: 1, name: "Bat" },
  { id: 2, name: "Saraa" },
];

app.get("/students", (req, res) => {
  res.json(students);
});

app.post("/students", (req, res) => {
  const name = String(req.body?.name || "").trim();
  if (!name) {
    return res.status(400).json({ message: "Name is required" });
  }

  const newStudent = {
    id: students.length + 1,
    name,
  };

  students.push(newStudent);
  res.status(201).json(newStudent);
});

app.listen(PORT, () => {
  console.log(`student-service running on ${PORT}`);
});
