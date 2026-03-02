const router = require('express').Router();
const { register, login, me } = require('../controllers/auth.controller');
const protect = require('../middleware/protect');
const asyncHandler = require('../middleware/asyncHandler');

router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.get('/me', protect, asyncHandler(me));

module.exports = router;
