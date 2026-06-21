const { validationResult } = require('express-validator');
const postService = require('../services/postService');
const notificationService = require('../services/notificationService');

const getUserId = (req) => {
  return req.user?.id || req.user?._id || req.user?.userId;
};

const addPost = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Lỗi dữ liệu đầu vào',
      errors: errors.array(),
    });
  }

  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Không xác định được người dùng từ token',
      });
    }

    const post = await postService.createPost(
      userId, 
      req.body.text, 
      req.body.isQuestion, 
      req.body.groupId, 
      req.body.codeSnippet, 
      req.body.codeLanguage
    );

    res.status(201).json({
      success: true,
      data: post,
    });
  } catch (err) {
    console.error(err.message);

    if (err.statusCode) {
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

const getPost = async (req, res) => {
  try {
    const post = await postService.getPostById(req.params.id);

    res.status(200).json({
      success: true,
      data: post,
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
      limit,
    });
  } catch (err) {
    console.error(err.message);

    res.status(500).json({
      success: false,
      message: 'Lỗi Server',
    });
  }
};

// @desc    Lấy top 10 bài viết nổi bật
const getTopTrendingPosts = async (req, res) => {
  try {
    const posts = await postService.getTopTrendingPosts();

    res.status(200).json({
      success: true,
      data: posts,
    });
  } catch (err) {
    console.error(err.message);

    res.status(500).json({
      success: false,
      message: 'Lỗi Server',
    });
  }
};

// @desc    Lưu / Bỏ lưu bài viết
const savePost = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Không xác định được người dùng từ token',
      });
    }

    const result = await postService.toggleSavePost(userId, req.params.id);

    res.status(200).json({
      success: true,
      message: result.isSaved ? 'Đã lưu bài viết' : 'Đã bỏ lưu bài viết',
      data: result,
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

// @desc    Lấy danh sách bài viết đã lưu
const getSavedPosts = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Không xác định được người dùng từ token',
      });
    }

    const posts = await postService.getSavedPosts(userId);

    res.status(200).json({
      success: true,
      data: posts,
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

// @desc    Like / Unlike bài viết
const likePost = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Không xác định được người dùng từ token',
      });
    }

    const result = await postService.toggleLikePost(req.params.id, userId);

    // Chỉ tạo thông báo khi Like, không tạo khi Unlike
    if (
      result.liked &&
      result.postOwnerId &&
      result.postOwnerId.toString() !== userId.toString()
    ) {
      await notificationService.createNotification(
        result.postOwnerId,
        userId,
        'like',
        req.params.id
      );
    }

    res.status(200).json({
      success: true,
      message: result.liked ? 'Đã thích bài viết' : 'Đã hủy thích bài viết',
      liked: result.liked,
      likesCount: result.likesCount,
      likes: result.likes,
      data: result.likes,
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

// @desc    Thêm bình luận
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
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Không xác định được người dùng từ token',
      });
    }

    const result = await postService.addComment(
      req.params.id,
      userId,
      req.body.text,
      req.body.codeSnippet,
      req.body.codeLanguage
    );

    // Tạo thông báo khi comment mới
    if (
      result.postOwnerId &&
      result.postOwnerId.toString() !== userId.toString()
    ) {
      await notificationService.createNotification(
        result.postOwnerId,
        userId,
        'comment',
        req.params.id
      );
    }

    res.status(201).json({
      success: true,
      message: 'Thêm bình luận thành công',
      comments: result.comments,
      data: result.comments,
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

// @desc    Cập nhật bài viết
const updatePost = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Lỗi dữ liệu đầu vào',
      errors: errors.array(),
    });
  }

  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Không xác định được người dùng từ token' });
    }

    const post = await postService.updatePost(
      req.params.id, 
      userId, 
      req.body.text, 
      req.body.isQuestion,
      req.body.codeSnippet,
      req.body.codeLanguage
    );

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (err) {
    console.error(err.message);
    if (err.statusCode === 404 || err.statusCode === 400 || err.statusCode === 401) {
      return res.status(err.statusCode).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: 'Lỗi Server' });
  }
};

// @desc    Xóa bài viết
const deletePost = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Không xác định được người dùng từ token' });
    }

    const result = await postService.deletePost(req.params.id, userId);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (err) {
    console.error(err.message);
    if (err.statusCode === 404 || err.statusCode === 400 || err.statusCode === 401) {
      return res.status(err.statusCode).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: 'Lỗi Server' });
  }
};

// @desc    Sửa bình luận
const updateComment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Lỗi dữ liệu đầu vào', errors: errors.array() });
  }

  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const comments = await postService.updateComment(req.params.id, req.params.comment_id, userId, req.body.text);

    res.status(200).json({
      success: true,
      message: 'Sửa bình luận thành công',
      data: comments,
    });
  } catch (err) {
    console.error(err.message);
    if (err.statusCode) return res.status(err.statusCode).json({ success: false, message: err.message });
    res.status(500).json({ success: false, message: 'Lỗi Server' });
  }
};

// @desc    Xóa bình luận
const deleteComment = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const comments = await postService.deleteComment(req.params.id, req.params.comment_id, userId);

    res.status(200).json({
      success: true,
      message: 'Xóa bình luận thành công',
      data: comments,
    });
  } catch (err) {
    console.error(err.message);
    if (err.statusCode) return res.status(err.statusCode).json({ success: false, message: err.message });
    res.status(500).json({ success: false, message: 'Lỗi Server' });
  }
};

// @desc    Chấp nhận câu trả lời
const acceptAnswer = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const data = await postService.acceptAnswer(req.params.id, req.params.comment_id, userId);

    res.status(200).json({
      success: true,
      message: 'Cập nhật trạng thái câu trả lời thành công',
      data: data.comments,
      post: data.post
    });
  } catch (err) {
    console.error(err.message);
    if (err.statusCode) return res.status(err.statusCode).json({ success: false, message: err.message });
    res.status(500).json({ success: false, message: 'Lỗi Server' });
  }
};

// @desc    Phê duyệt bình luận (Upvote / Approve Comment)
const approveComment = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const comments = await postService.approveComment(req.params.id, req.params.comment_id, userId);

    res.status(200).json({
      success: true,
      message: 'Cập nhật trạng thái phê duyệt bình luận thành công',
      data: comments,
    });
  } catch (err) {
    console.error(err.message);
    if (err.statusCode) return res.status(err.statusCode).json({ success: false, message: err.message });
    res.status(500).json({ success: false, message: 'Lỗi Server' });
  }
};

module.exports = {
  addPost,
  getPost,
  getAllPosts,
  getTopTrendingPosts,
  savePost,
  getSavedPosts,
  likePost,
  addComment,
  updatePost,
  deletePost,
  updateComment,
  deleteComment,
  acceptAnswer,
  approveComment,
};