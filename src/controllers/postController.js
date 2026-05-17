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
    const posts = await postService.getAllPosts();
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

// Tài: Like / Unlike bài viết
const likePost = async (req, res) => {
  try {
    const result = await postService.toggleLikePost(req.params.id, req.user.id);

    res.status(200).json({
      success: true,
      message: result.liked
        ? 'Đã thích bài viết'
        : 'Đã hủy thích bài viết',
      liked: result.liked,
      likesCount: result.likesCount,
      likes: result.likes,
    });
  } catch (err) {
    console.error(err.message);

    if (err.statusCode === 404 || err.statusCode === 400) {
      return res.status(err.statusCode).json({
        success: false,
        message: err.message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi Server',
    });
  }
};

// Tài: Thêm bình luận
const addComment = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Lỗi dữ liệu đầu vào',
      errors: errors.array(),
    });
  }

  try {
    const comments = await postService.addComment(
      req.params.id,
      req.user.id,
      req.body.text
    );

    res.status(201).json({
      success: true,
      message: 'Thêm bình luận thành công',
      comments,
    });
  } catch (err) {
    console.error(err.message);

    if (err.statusCode === 404 || err.statusCode === 400) {
      return res.status(err.statusCode).json({
        success: false,
        message: err.message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi Server',
    });
  }
};


module.exports = {
  addPost,
  getPost,
  getAllPosts,
  likePost,
  addComment,
};
