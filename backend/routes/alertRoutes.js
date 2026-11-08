const express = require('express');
const router = express.Router();
const {
  getAlerts,
  createAlert,
  resolveAlert
} = require('../controllers/alertController');
const { optionalAuth, protect } = require('../middleware/authMiddleware');

router.get('/', getAlerts);
router.post('/', optionalAuth, createAlert);
router.patch('/:id/resolve', protect, resolveAlert);

module.exports = router;