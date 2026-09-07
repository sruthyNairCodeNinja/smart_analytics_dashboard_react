const express = require('express');
const { getOverview } = require('../controllers/statsController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/overview', protect, getOverview);

module.exports = router;
