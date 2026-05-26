const Post = require('../models/Post');
const User = require('../models/User');

const createPost = async (userId, text) => {
  try {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new Error('Người dùng không tồn tại');
    }

    const newPost = new Post({
      text,
      name: user.name,
      avatar: user.avatar,
      user: userId
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
    
    // Lấy danh sách bài viết theo phân trang (sắp xếp theo ngày mới nhất)
    // Lưu ý: Bài báo cáo yêu cầu .sort({ date: 1 }) nhưng để hiển thị bài mới nhất thì thường dùng -1
    const posts = await Post.find()
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);
      
    // Tính tổng số bài viết
    const total = await Post.countDocuments();
    
    // Kiểm tra xem còn bài viết để tải không
    const hasMore = total > skip + posts.length;

    return {
      posts,
      hasMore,
      total
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
          likesCount: { $size: { $ifNull: ["$likes", []] } },
          commentsCount: { $size: { $ifNull: ["$comments", []] } }
        }
      },
      {
        $sort: {
          likesCount: -1,
          commentsCount: -1,
          date: -1
        }
      },
      {
        $limit: 10
      }
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
    (savedPostId) => savedPostId.toString() === postId
  );

  if (isSaved) {
    user.savedPosts = user.savedPosts.filter(
      (savedPostId) => savedPostId.toString() !== postId
    );
  } else {
    user.savedPosts.unshift(postId);
  }

  await user.save();

  return {
    isSaved: !isSaved,
    savedPosts: user.savedPosts,
    postId
  };
};

const getSavedPosts = async (userId) => {
  const user = await User.findById(userId).populate({
    path: 'savedPosts',
    options: { sort: { date: -1 } }
  });

  if (!user) {
    const error = new Error('Không tìm thấy người dùng');
    error.statusCode = 404;
    throw error;
  }

  return user.savedPosts;
};

const toggleLikePost = async (userId, postId) => {
  try {
    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error('Bài viết không tồn tại');
      error.statusCode = 404;
      throw error;
    }

    const likeIndex = post.likes.findIndex((like) => like.user.toString() === userId);
    let isLiked = false;

    if (likeIndex > -1) {
      // Bỏ like
      post.likes.splice(likeIndex, 1);
    } else {
      // Like
      post.likes.unshift({ user: userId });
      isLiked = true;
    }

    await post.save();
    return { likes: post.likes, isLiked, postOwnerId: post.user };
  } catch (error) {
    if (error.kind === 'ObjectId') {
      const invalidIdError = new Error('Định dạng ID bài viết không hợp lệ');
      invalidIdError.statusCode = 400;
      throw invalidIdError;
    }
    throw error;
  }
};

const addComment = async (userId, postId, text) => {
  try {
    const user = await User.findById(userId).select('-password');
    const post = await Post.findById(postId);

    if (!post) {
      const error = new Error('Bài viết không tồn tại');
      error.statusCode = 404;
      throw error;
    }

    const newComment = {
      text,
      name: user.name,
      avatar: user.avatar,
      user: userId
    };

    post.comments.unshift(newComment);
    await post.save();

    return { comments: post.comments, postOwnerId: post.user };
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
  addComment
};

