const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const validate = require('../middlewares/validate');
const { registerValidation, loginValidation } = require('../validators/auth.validators');

router.post('/register', validate(registerValidation), authController.register);
router.post('/login', validate(loginValidation), authController.login);

module.exports = router;
