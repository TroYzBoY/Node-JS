const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 4002;

app.use(cors());
app.use(express.json());

let courses = [
  { id: 1, title: "Backend Development" },
  { id: 2, title: "System Design" },
];

app.get("/courses", (req, res) => {
  res.json(courses);
});

app.post("/courses", (req, res) => {
  const title = String(req.body?.title || "").trim();
  if (!title) {
    return res.status(400).json({ message: "Title is required" });
  }

  const newCourse = {
    id: courses.length + 1,
    title,
  };

  courses.push(newCourse);
  res.status(201).json(newCourse);
});

app.listen(PORT, () => {
  console.log(`course-service running on ${PORT}`);
});
