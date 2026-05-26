const express = require('express');
const router = express.Router();
const { check } = require('express-validator');

const { verifyToken } = require('../middlewares/authMiddleware');
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
      check('text', 'Nội dung không được để trống').not().isEmpty(),
    ],
  ],
  postController.addPost
);

// @route   GET /api/posts/top-trending
// @desc    Lấy top 10 bài viết nổi bật
// @access  Public
router.get('/top-trending', postController.getTopTrendingPosts);

// Đặt các route cụ thể trước /:id để tránh bị hiểu nhầm là id bài viết

// @route   PUT /api/posts/like/:id
// @desc    Like / Unlike bài viết
// @access  Private
router.put('/like/:id', verifyToken, postController.likePost);

// @route   POST /api/posts/comment/:id
// @desc    Thêm bình luận vào bài viết
// @access  Private
router.post(
  '/comment/:id',
  [
    verifyToken,
    [
      check('text', 'Nội dung bình luận không được để trống')
        .trim()
        .not()
        .isEmpty(),
    ],
  ],
  postController.addComment
);

// @route   GET /api/posts/:id
// @desc    Lấy bài viết theo ID
// @access  Public
router.get('/:id', postController.getPost);

module.exports = router;