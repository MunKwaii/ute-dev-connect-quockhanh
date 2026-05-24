const express = require('express');
const router = express.Router();
const { check } = require('express-validator');

const { verifyToken } = require('../middlewares/authMiddleware');
const postController = require('../controllers/postController');

// @route   GET /api/posts
// @desc    Lấy tất cả bài viết
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
// @desc    Lấy top 10 bài viết nổi bật
// @access  Public
router.get('/top-trending', postController.getTopTrendingPosts);

// @route   PUT /api/posts/save/:id
// @desc    Lưu hoặc bỏ lưu bài viết
// @access  Private
router.put('/save/:id', verifyToken, postController.savePost);

// @route   GET /api/posts/saved
// @desc    Lấy danh sách bài viết đã lưu
// @access  Private
router.get('/saved', verifyToken, postController.getSavedPosts);

// @route   GET /api/posts/:id
// @desc    Lấy bài viết theo ID
// @access  Public
router.get('/:id', postController.getPost);

module.exports = router;