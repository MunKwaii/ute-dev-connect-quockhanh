const express = require('express');
const router = express.Router();
const { check } = require('express-validator');

// Import middlewares
const { verifyToken } = require('../middlewares/authMiddleware');

// Import controller
const postController = require('../controllers/postController');

// @route   GET /api/posts
// @desc    Lấy tất cả bài viết mới nhất
// @access  Public
router.get('/', postController.getAllPosts);

// @route   POST /api/posts
// @desc    Tạo bài viết mới
// @access  Private
router.post(
  '/',
  [
    verifyToken,
    [
      check('text', 'Nội dung không được để trống').not().isEmpty()
    ]
  ],
  postController.addPost
);

// @route   GET /api/posts/top-trending
// @desc    Lấy top 10 bài viết nổi bật (nhiều likes/comments nhất)
// @access  Public
router.get('/top-trending', postController.getTopTrendingPosts);

// @route   GET /api/posts/:id
// @desc    Lấy bài viết theo ID
// @access  Public

// @route   PUT /api/posts/save/:id
// @desc    Lưu hoặc bỏ lưu bài viết
// @access  Private
router.put('/save/:id', verifyToken, postController.savePost);

// @route   GET /api/posts/saved
// @desc    Lấy danh sách bài viết đã lưu
// @access  Private
router.get('/saved', verifyToken, postController.getSavedPosts);
router.get('/:id', postController.getPost);

module.exports = router;

