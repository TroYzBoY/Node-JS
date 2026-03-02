const express = require('express');
const router = express.Router();

const { createProfile } = require('../src/controllers/profile.controller');

router.post('/profile', createProfile);

module.exports = router;
