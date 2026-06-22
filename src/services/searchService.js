const Post = require('../models/Post');
const Group = require('../models/Group');
const User = require('../models/User');
const Profile = require('../models/Profile');

/**
 * Tìm kiếm bài viết
 * - Full-text search qua $text (đã có index trên Post.text + Post.tags)
 * - Hoặc filter theo tag cụ thể
 * - Chỉ tìm trong bài viết PUBLIC (group: null)
 */
const searchPosts = async (keyword = '', tag = '', page = 1, limit = 10, currentUserId = null) => {
  const skip = (page - 1) * limit;

  let filter = { 
    group: null,
    isDeleted: { $ne: true },
    isHidden: { $ne: true }
  };

  if (tag && tag.trim()) {
    // Lọc chính xác theo tag (ví dụ: "react", "nodejs")
    filter.tags = { $in: [tag.trim().toLowerCase()] };
  }

  // Lọc theo visibility
  if (currentUserId) {
    const user = await User.findById(currentUserId);
    if (user) {
      const followingIds = user.following.map(f => f.user);
      const followerIds = user.followers.map(f => f.user);
      const friendIds = followingIds.filter(id => 
        followerIds.some(fId => fId.toString() === id.toString())
      );

      filter.$and = [
        {
          $or: [
            { visibility: 'public' },
            { visibility: { $exists: false } },
            { user: currentUserId },
            { visibility: 'followers', user: { $in: followingIds } },
            { visibility: 'friends', user: { $in: friendIds } }
          ]
        }
      ];
    } else {
      filter.visibility = 'public';
    }
  } else {
    filter.$or = [
      { visibility: 'public' },
      { visibility: { $exists: false } }
    ];
  }

  let posts;
  let total;

  if (keyword && keyword.trim()) {
    // Full-text search với MongoDB $text
    filter.$text = { $search: keyword.trim() };

    posts = await Post.find(filter, { score: { $meta: 'textScore' } })
      .populate('user', 'name avatar reputation')
      .sort({ score: { $meta: 'textScore' }, date: -1 })
      .skip(skip)
      .limit(limit);

    total = await Post.countDocuments(filter);
  } else {
    // Không có keyword → chỉ lọc theo tag hoặc trả về tất cả
    posts = await Post.find(filter)
      .populate('user', 'name avatar reputation')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);
    total = await Post.countDocuments(filter);
  }

  const hasMore = total > skip + posts.length;
  return { posts, total, hasMore };
};

/**
 * Tìm kiếm nhóm học tập theo tên hoặc mô tả
 */
const searchGroups = async (keyword = '', page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const filter = { isActive: true };

  if (keyword && keyword.trim()) {
    filter.$or = [
      { name: { $regex: keyword.trim(), $options: 'i' } },
      { description: { $regex: keyword.trim(), $options: 'i' } },
      { tags: { $in: [keyword.trim().toLowerCase()] } },
    ];
  }

  const groups = await Group.find(filter)
    .populate('admin', 'name avatar')
    .sort({ date: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Group.countDocuments(filter);
  const hasMore = total > skip + groups.length;

  return { groups, total, hasMore };
};

/**
 * Tìm kiếm lập trình viên theo tên (User) hoặc kỹ năng (Profile)
 * - Tìm User theo tên → lấy Profile tương ứng
 * - Hoặc tìm Profile theo skill → join với User
 */
const searchDevelopers = async (keyword = '', skill = '', page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  let profileFilter = {};
  let userIds = [];

  // Lọc theo kỹ năng trong Profile
  if (skill && skill.trim()) {
    profileFilter.skills = { $elemMatch: { $regex: skill.trim(), $options: 'i' } };
  }

  // Tìm User theo tên để lấy danh sách userIds
  if (keyword && keyword.trim()) {
    const matchedUsers = await User.find({
      name: { $regex: keyword.trim(), $options: 'i' },
    }).select('_id');
    userIds = matchedUsers.map((u) => u._id);
    profileFilter.user = { $in: userIds };
  }

  // Nếu không có filter nào thì trả về tất cả profile
  const profiles = await Profile.find(profileFilter)
    .populate('user', 'name avatar email')
    .sort({ date: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Profile.countDocuments(profileFilter);
  const hasMore = total > skip + profiles.length;

  return { developers: profiles, total, hasMore };
};

module.exports = {
  searchPosts,
  searchGroups,
  searchDevelopers,
};
