const { body } = require('express-validator');

exports.updateUserValidation = [
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('username').optional().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('role').optional().isIn(['USER', 'ADMIN', 'MODERATOR']).withMessage('Role must be USER, ADMIN or MODERATOR'),
];
