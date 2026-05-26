const Post = require('../models/Post');
const User = require('../models/User');

const createPost = async (userId, text) => {
  try {
    const user = await User.findById(userId).select('-password');

    if (!user) {
      const error = new Error('Người dùng không tồn tại');
      error.statusCode = 404;
      throw error;
    }

    const newPost = new Post({
      text,
      name: user.name,
      avatar: user.avatar,
      user: userId,
    });

    const post = await newPost.save();
    return post;
  } catch (error) {
    throw error;
  }
};

const getPostById = async (postId) => {
  try {
    const post = await Post.findById(postId);

    if (!post) {
      const error = new Error('Bài viết không tồn tại');
      error.statusCode = 404;
      throw error;
    }

    return post;
  } catch (error) {
    if (error.kind === 'ObjectId') {
      const invalidIdError = new Error('Định dạng ID bài viết không hợp lệ');
      invalidIdError.statusCode = 400;
      throw invalidIdError;
    }

    throw error;
  }
};

const getAllPosts = async (page = 1, limit = 5) => {
  try {
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments();
    const hasMore = total > skip + posts.length;

    return {
      posts,
      hasMore,
      total,
    };
  } catch (error) {
    throw error;
  }
};

const getTopTrendingPosts = async () => {
  try {
    const posts = await Post.aggregate([
      {
        $addFields: {
          likesCount: { $size: { $ifNull: ['$likes', []] } },
          commentsCount: { $size: { $ifNull: ['$comments', []] } },
        },
      },
      {
        $sort: {
          likesCount: -1,
          commentsCount: -1,
          date: -1,
        },
      },
      {
        $limit: 10,
      },
    ]);

    return posts;
  } catch (error) {
    throw error;
  }
};

const toggleSavePost = async (userId, postId) => {
  const post = await Post.findById(postId);

  if (!post) {
    const error = new Error('Không tìm thấy bài viết');
    error.statusCode = 404;
    throw error;
  }

  const user = await User.findById(userId);

  if (!user) {
    const error = new Error('Không tìm thấy người dùng');
    error.statusCode = 404;
    throw error;
  }

  const isSaved = user.savedPosts.some(
    (savedPostId) => savedPostId.toString() === postId.toString()
  );

  if (isSaved) {
    user.savedPosts = user.savedPosts.filter(
      (savedPostId) => savedPostId.toString() !== postId.toString()
    );
  } else {
    user.savedPosts.unshift(postId);
  }

  await user.save();

  return {
    isSaved: !isSaved,
    savedPosts: user.savedPosts,
    postId,
  };
};

const getSavedPosts = async (userId) => {
  const user = await User.findById(userId).populate({
    path: 'savedPosts',
    options: { sort: { date: -1 } },
  });

  if (!user) {
    const error = new Error('Không tìm thấy người dùng');
    error.statusCode = 404;
    throw error;
  }

  return user.savedPosts;
};

// Like / Unlike bài viết dạng toggle
const toggleLikePost = async (postId, userId) => {
  try {
    const post = await Post.findById(postId);

    if (!post) {
      const error = new Error('Bài viết không tồn tại');
      error.statusCode = 404;
      throw error;
    }

    const likedIndex = post.likes.findIndex(
      (like) => like.user.toString() === userId.toString()
    );

    let liked = false;

    if (likedIndex === -1) {
      post.likes.unshift({ user: userId });
      liked = true;
    } else {
      post.likes.splice(likedIndex, 1);
      liked = false;
    }

    await post.save();

    return {
      liked,
      isLiked: liked,
      likesCount: post.likes.length,
      likes: post.likes,
      postOwnerId: post.user,
    };
  } catch (error) {
    if (error.kind === 'ObjectId') {
      const invalidIdError = new Error('Định dạng ID bài viết không hợp lệ');
      invalidIdError.statusCode = 400;
      throw invalidIdError;
    }

    throw error;
  }
};

// Thêm bình luận vào bài viết
const addComment = async (postId, userId, text) => {
  try {
    const normalizedText = text ? text.trim() : '';

    if (!normalizedText) {
      const error = new Error('Nội dung bình luận không được để trống');
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findById(userId).select('-password');

    if (!user) {
      const error = new Error('Người dùng không tồn tại');
      error.statusCode = 404;
      throw error;
    }

    const post = await Post.findById(postId);

    if (!post) {
      const error = new Error('Bài viết không tồn tại');
      error.statusCode = 404;
      throw error;
    }

    const newComment = {
      user: userId,
      text: normalizedText,
      name: user.name,
      avatar: user.avatar,
    };

    post.comments.unshift(newComment);
    await post.save();

    return {
      comments: post.comments,
      postOwnerId: post.user,
    };
  } catch (error) {
    if (error.kind === 'ObjectId') {
      const invalidIdError = new Error('Định dạng ID bài viết không hợp lệ');
      invalidIdError.statusCode = 400;
      throw invalidIdError;
    }

    throw error;
  }
};

module.exports = {
  createPost,
  getPostById,
  getAllPosts,
  getTopTrendingPosts,
  toggleSavePost,
  getSavedPosts,
  toggleLikePost,
  addComment,
};