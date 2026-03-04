export function createStudentDTO(body) {
  return {
    name: body?.name,
    email: body?.email,
    grade: Number(body?.grade),
    gpa: Number(body?.gpa),
  };
}

export function toStudentResponseDTO(student) {
  return {
    id: student.id,
    name: student.name,
    email: student.email,
    grade: student.grade,
    gpa: student.gpa,
  };
}
