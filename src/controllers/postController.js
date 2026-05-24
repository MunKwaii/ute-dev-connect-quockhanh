const { validationResult } = require('express-validator');
const postService = require('../services/postService');

const addPost = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Lỗi dữ liệu đầu vào',
      errors: errors.array()
    });
  }

  try {
    const post = await postService.createPost(req.user.id, req.body.text);
    res.status(201).json({
      success: true,
      data: post
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi Server'
    });
  }
};

const getPost = async (req, res) => {
  try {
    const post = await postService.getPostById(req.params.id);
    res.status(200).json({
      success: true,
      data: post
    });
  } catch (err) {
    console.error(err.message);
    if (err.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: err.message
      });
    }
    if (err.statusCode === 400) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    res.status(500).json({
      success: false,
      message: 'Lỗi Server'
    });
  }
};

// @desc    Lấy tất cả bài viết
const getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 5;

    const result = await postService.getAllPosts(page, limit);
    res.status(200).json({
      success: true,
      data: result.posts,
      hasMore: result.hasMore,
      total: result.total,
      page,
      limit
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi Server'
    });
  }
};

// @desc    Lấy top 10 bài viết nổi bật (nhiều likes/comments nhất)
const getTopTrendingPosts = async (req, res) => {
  try {
    const posts = await postService.getTopTrendingPosts();
    res.status(200).json({
      success: true,
      data: posts
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi Server'
    });
  }
};

const savePost = async (req, res) => {
  try {
    const result = await postService.toggleSavePost(req.user.id, req.params.id);

    res.status(200).json({
      success: true,
      message: result.isSaved
        ? 'Đã lưu bài viết'
        : 'Đã bỏ lưu bài viết',
      data: result
    });
  } catch (err) {
    console.error(err.message);

    if (err.statusCode === 404 || err.statusCode === 400) {
      return res.status(err.statusCode).json({
        success: false,
        message: err.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi Server'
    });
  }
};

const getSavedPosts = async (req, res) => {
  try {
    const posts = await postService.getSavedPosts(req.user.id);

    res.status(200).json({
      success: true,
      data: posts
    });
  } catch (err) {
    console.error(err.message);

    if (err.statusCode === 404 || err.statusCode === 400) {
      return res.status(err.statusCode).json({
        success: false,
        message: err.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi Server'
    });
  }
};

module.exports = {
  addPost,
  getPost,
  getAllPosts,
  getTopTrendingPosts,
  savePost,
  getSavedPosts
};
