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
    .populate('members.user', 'name avatar')
    .populate('moderators', 'name avatar');

  if (!group) {
    const err = new Error('Nhóm không tồn tại hoặc đã bị xóa');
    err.statusCode = 404;
    throw err;
  }

  return {
    ...group.toObject(),
    isMember: userId ? isMember(group, userId) : false,
    isAdmin: userId ? group.admin._id.toString() === userId.toString() : false,
    isMod: userId ? group.moderators && group.moderators.some(m => (m._id || m).toString() === userId.toString()) : false,
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
const getGroupFeed = async (groupId, userId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const filter = {
    group: groupId,
    $or: [
      { status: 'approved' },
      { user: userId, status: 'pending' }
    ]
  };

  const posts = await Post.find(filter)
    .sort({ date: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Post.countDocuments(filter);
  const hasMore = total > skip + posts.length;

  return { posts, total, hasMore };
};

/**
 * Thăng chức / hạ chức Moderator (kiểm duyệt viên)
 */
const toggleModerator = async (groupId, adminId, targetUserId) => {
  const group = await Group.findOne({ _id: groupId, isActive: true });
  if (!group) {
    const err = new Error('Nhóm không tồn tại');
    err.statusCode = 404;
    throw err;
  }

  // 1. Kiểm tra xem người gọi có phải admin nhóm không
  if (group.admin.toString() !== adminId.toString()) {
    const err = new Error('Chỉ admin nhóm mới có quyền thăng chức/bãi chức kiểm duyệt viên');
    err.statusCode = 403;
    throw err;
  }

  // 2. Không được tự thăng chức/hạ chức chính mình
  if (targetUserId.toString() === adminId.toString()) {
    const err = new Error('Không thể thăng chức/bãi chức chủ nhóm');
    err.statusCode = 400;
    throw err;
  }

  // 3. Kiểm tra xem targetUserId có phải thành viên nhóm không
  const isTargetMember = group.members.some(m => m.user.toString() === targetUserId.toString());
  if (!isTargetMember) {
    const err = new Error('Người dùng không phải thành viên của nhóm này');
    err.statusCode = 400;
    throw err;
  }

  if (!group.moderators) {
    group.moderators = [];
  }

  const modIndex = group.moderators.findIndex(m => m.toString() === targetUserId.toString());
  let action = '';

  if (modIndex === -1) {
    group.moderators.push(targetUserId);
    action = 'promote';
  } else {
    group.moderators.splice(modIndex, 1);
    action = 'demote';
  }

  await group.save();
  return { group, action };
};

/**
 * Lấy danh sách bài đăng chờ duyệt (chỉ admin / mod)
 */
const getPendingPosts = async (groupId, userId) => {
  const group = await Group.findOne({ _id: groupId, isActive: true });
  if (!group) {
    const err = new Error('Nhóm không tồn tại');
    err.statusCode = 404;
    throw err;
  }

  const isAdmin = group.admin.toString() === userId.toString();
  const isMod = group.moderators && group.moderators.some(m => m.toString() === userId.toString());

  if (!isAdmin && !isMod) {
    const err = new Error('Chỉ admin hoặc kiểm duyệt viên mới có quyền xem bài viết chờ duyệt');
    err.statusCode = 403;
    throw err;
  }

  const posts = await Post.find({ group: groupId, status: 'pending' }).sort({ date: -1 });
  return posts;
};

/**
 * Phê duyệt / từ chối bài viết (chỉ admin / mod)
 */
const updatePostStatus = async (groupId, postId, userId, status) => {
  const group = await Group.findOne({ _id: groupId, isActive: true });
  if (!group) {
    const err = new Error('Nhóm không tồn tại');
    err.statusCode = 404;
    throw err;
  }

  const isAdmin = group.admin.toString() === userId.toString();
  const isMod = group.moderators && group.moderators.some(m => m.toString() === userId.toString());

  if (!isAdmin && !isMod) {
    const err = new Error('Chỉ admin hoặc kiểm duyệt viên mới có quyền duyệt bài viết');
    err.statusCode = 403;
    throw err;
  }

  const post = await Post.findOne({ _id: postId, group: groupId });
  if (!post) {
    const err = new Error('Bài viết không tồn tại trong nhóm này');
    err.statusCode = 404;
    throw err;
  }

  if (status === 'approved') {
    post.status = 'approved';
    await post.save();
  } else if (status === 'rejected') {
    await post.deleteOne();
  } else {
    const err = new Error('Trạng thái duyệt không hợp lệ');
    err.statusCode = 400;
    throw err;
  }

  return { message: status === 'approved' ? 'Đã phê duyệt bài viết' : 'Đã từ chối và xóa bài viết' };
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
  toggleModerator,
  getPendingPosts,
  updatePostStatus,
};
