const router = require('express').Router();
const userController = require('../controllers/user.controller');
const { requireAuth, requireRole } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { updateUserValidation } = require('../validators/user.validators');

// Public: list users
router.get('/', userController.getUsers);

// Protected
router.get('/:id', requireAuth, userController.getUser);
router.patch('/:id', requireAuth, validate(updateUserValidation), userController.updateUser);
router.delete('/:id', requireAuth, requireRole('ADMIN'), userController.deleteUser);

module.exports = router;
