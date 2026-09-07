const express = require('express');
const { listAlerts, resolveAlert } = require('../controllers/alertController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', listAlerts);
router.patch('/:id/resolve', authorize('admin'), resolveAlert);

module.exports = router;
