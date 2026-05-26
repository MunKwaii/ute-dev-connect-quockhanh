const Notification = require('../models/Notification');
const User = require('../models/User');

const createNotification = async (recipientId, senderId, type, postId = null) => {
  try {
    // Không tạo thông báo nếu user tự tương tác với chính mình
    if (recipientId.toString() === senderId.toString()) {
      return null;
    }

    const notification = new Notification({
      recipient: recipientId,
      sender: senderId,
      type,
      post: postId
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error('Lỗi khi tạo thông báo:', error.message);
    throw error;
  }
};

const getNotifications = async (userId) => {
  try {
    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .populate('sender', 'name avatar')
      .populate('post', 'text'); // Optional: populate post to show some text if needed
    
    return notifications;
  } catch (error) {
    throw error;
  }
};

const markAsRead = async (notificationId, userId) => {
  try {
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      const error = new Error('Không tìm thấy thông báo');
      error.statusCode = 404;
      throw error;
    }

    if (notification.recipient.toString() !== userId) {
      const error = new Error('Không có quyền thao tác');
      error.statusCode = 401;
      throw error;
    }

    notification.isRead = true;
    await notification.save();
    return notification;
  } catch (error) {
    throw error;
  }
};

const markAllAsRead = async (userId) => {
  try {
    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { $set: { isRead: true } }
    );
    return { message: 'Đã đánh dấu đọc tất cả' };
  } catch (error) {
    throw error;
  }
};

const getUnreadCount = async (userId) => {
  try {
    const count = await Notification.countDocuments({ recipient: userId, isRead: false });
    return count;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount
};
