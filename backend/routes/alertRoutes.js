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

// Acepta con y sin /resolve
router.patch('/:id/resolve', protect, resolveAlert);
router.patch('/:id', protect, resolveAlert);
router.put('/:id/resolve', protect, resolveAlert);

module.exports = router;