const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 4003;

app.use(cors());
app.use(express.json());

let readModel = [
  { id: 1, name: "Bat" },
  { id: 2, name: "Naraa" },
];

app.get("/students", (req, res) => {
  res.json(readModel);
});

app.post("/students/sync", (req, res) => {
  const name = String(req.body?.name || "").trim();
  if (!name) {
    return res.status(400).json({ message: "Name is required" });
  }

  const newStudent = {
    id: readModel.length + 1,
    name,
  };

  readModel.push(newStudent);
  res.status(201).json({
    message: "Read model updated",
    student: newStudent,
  });
});

app.listen(PORT, () => {
  console.log(`student-query-service running on ${PORT}`);
});
