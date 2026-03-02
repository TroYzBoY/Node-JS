const {
  sanitizeUser,
  listStudents,
  deleteStudentById,
  findStudentById,
} = require('./user.service');

const getStudents = async (req, res) => {
  const students = await listStudents();
  return res.status(200).json({
    students: students.map(sanitizeUser),
  });
};

const deleteStudent = async (req, res) => {
  const { id } = req.params;

  const student = await findStudentById(id);
  if (!student) {
    return res.status(404).json({ message: 'Student not found' });
  }

  const deleted = await deleteStudentById(id);
  return res.status(200).json({
    message: 'Student deleted',
    student: sanitizeUser(deleted),
  });
};

module.exports = {
  getStudents,
  deleteStudent,
};
