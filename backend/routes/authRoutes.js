const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  getNeighborProfile,
  endorseNeighbor
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.get('/vecino/:id', protect, getNeighborProfile);
router.post('/vecino/:id/vistobueno', protect, endorseNeighbor);

module.exports = router;