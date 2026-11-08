const express = require('express');
const router = express.Router();
const {
  getPosts,
  createPost,
  addComment
} = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getPosts);
router.post('/', protect, createPost);
router.post('/:id/comments', protect, addComment);

module.exports = router;