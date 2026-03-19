import eventBus from "./eventBus.js";

let nextId = 1;
const students = [];

export function createStudent({ name, email }) {
  const student = {
    id: nextId++,
    name,
    email,
    createdAt: new Date().toISOString(),
  };

  students.push(student);
  console.log("Student created:", student.name);
  eventBus.emit("student.created", student);

  return student;
}

export function listStudents() {
  return students;
}
