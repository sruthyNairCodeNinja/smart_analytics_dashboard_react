const express = require('express');
const { getLatestReadings } = require('../controllers/readingController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/latest', protect, getLatestReadings);

module.exports = router;
