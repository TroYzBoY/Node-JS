const express = require('express');
const controller = require('../controllers/borrow.controller');

const router = express.Router();

router.post('/borrow', controller.borrow);
router.post('/return', controller.returnBook);
router.get('/stats', controller.stats);

module.exports = router;
