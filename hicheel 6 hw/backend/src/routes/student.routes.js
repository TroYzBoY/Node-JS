const router = require('express').Router();
const { getStudents, deleteStudent } = require('../controllers/student.controller');
const protect = require('../middleware/protect');
const authorize = require('../middleware/authorize');
const asyncHandler = require('../middleware/asyncHandler');

router.get('/', protect, authorize('ADMIN', 'TEACHER'), asyncHandler(getStudents));
router.delete('/:id', protect, authorize('ADMIN'), asyncHandler(deleteStudent));

module.exports = router;
