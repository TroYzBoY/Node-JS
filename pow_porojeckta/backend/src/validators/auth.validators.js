const { body } = require('express-validator');

exports.registerValidation = [
  body('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email format'),
  body('password').notEmpty().withMessage('Password is required').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('username').notEmpty().withMessage('Username is required').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
];

exports.loginValidation = [
  body('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email format'),
  body('password').notEmpty().withMessage('Password is required'),
];
