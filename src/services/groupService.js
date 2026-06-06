const Group = require('../models/Group');
const Post = require('../models/Post');
const User = require('../models/User');

// Helper: kiểm tra userId có phải thành viên của nhóm không
const isMember = (group, userId) => {
  return group.members.some(
    (m) => m.user.toString() === userId.toString()
  );
};

/**
 * Tạo nhóm mới
 * - Admin tự động được thêm vào members
 */
const createGroup = async (userId, { name, description, tags }) => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    const err = new Error('Người dùng không tồn tại');
    err.statusCode = 404;
    throw err;
  }

  const group = new Group({
    name,
    description: description || '',
    tags: tags || [],
    admin: userId,
    members: [{ user: userId }],
  });

  await group.save();
  return group;
};

/**
 * Lấy tất cả nhóm đang hoạt động (có phân trang + tìm kiếm tên)
 */
const getAllGroups = async (page = 1, limit = 10, keyword = '') => {
  const skip = (page - 1) * limit;
  const filter = { isActive: true };

  if (keyword && keyword.trim()) {
    filter.$or = [
      { name: { $regex: keyword.trim(), $options: 'i' } },
      { description: { $regex: keyword.trim(), $options: 'i' } },
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
 * Lấy chi tiết một nhóm theo ID
 */
const getGroupById = async (groupId, userId) => {
  const group = await Group.findOne({ _id: groupId, isActive: true })
    .populate('admin', 'name avatar')
    .populate('members.user', 'name avatar');

  if (!group) {
    const err = new Error('Nhóm không tồn tại hoặc đã bị xóa');
    err.statusCode = 404;
    throw err;
  }

  return {
    ...group.toObject(),
    isMember: userId ? isMember(group, userId) : false,
    isAdmin: userId ? group.admin._id.toString() === userId.toString() : false,
    membersCount: group.members.length,
  };
};

/**
 * Tham gia nhóm
 */
const joinGroup = async (groupId, userId) => {
  const group = await Group.findOne({ _id: groupId, isActive: true });

  if (!group) {
    const err = new Error('Nhóm không tồn tại');
    err.statusCode = 404;
    throw err;
  }

  if (isMember(group, userId)) {
    const err = new Error('Bạn đã là thành viên của nhóm này');
    err.statusCode = 400;
    throw err;
  }

  group.members.push({ user: userId });
  await group.save();

  return { message: 'Tham gia nhóm thành công', membersCount: group.members.length };
};

/**
 * Rời nhóm
 * - Admin không được rời nếu vẫn còn thành viên khác (phải xóa nhóm hoặc transfer)
 */
const leaveGroup = async (groupId, userId) => {
  const group = await Group.findOne({ _id: groupId, isActive: true });

  if (!group) {
    const err = new Error('Nhóm không tồn tại');
    err.statusCode = 404;
    throw err;
  }

  if (!isMember(group, userId)) {
    const err = new Error('Bạn không phải thành viên của nhóm này');
    err.statusCode = 400;
    throw err;
  }

  const isAdmin = group.admin.toString() === userId.toString();
  if (isAdmin && group.members.length > 1) {
    const err = new Error('Admin không thể rời nhóm khi còn thành viên khác. Hãy xóa nhóm hoặc chuyển quyền admin.');
    err.statusCode = 400;
    throw err;
  }

  group.members = group.members.filter(
    (m) => m.user.toString() !== userId.toString()
  );
  await group.save();

  return { message: 'Rời nhóm thành công', membersCount: group.members.length };
};

/**
 * Soft delete nhóm (chỉ admin nhóm mới được xóa)
 */
const deleteGroup = async (groupId, userId) => {
  const group = await Group.findOne({ _id: groupId, isActive: true });

  if (!group) {
    const err = new Error('Nhóm không tồn tại');
    err.statusCode = 404;
    throw err;
  }

  if (group.admin.toString() !== userId.toString()) {
    const err = new Error('Chỉ admin nhóm mới có quyền xóa nhóm');
    err.statusCode = 403;
    throw err;
  }

  group.isActive = false;
  await group.save();

  return { message: 'Xóa nhóm thành công' };
};

/**
 * Lấy newsfeed của nhóm (chỉ thành viên mới xem được)
 * Việc kiểm tra tư cách thành viên được thực hiện bởi middleware requireGroupMember
 */
const getGroupFeed = async (groupId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const posts = await Post.find({ group: groupId })
    .sort({ date: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Post.countDocuments({ group: groupId });
  const hasMore = total > skip + posts.length;

  return { posts, total, hasMore };
};

module.exports = {
  createGroup,
  getAllGroups,
  getGroupById,
  joinGroup,
  leaveGroup,
  deleteGroup,
  getGroupFeed,
  isMember,
};
