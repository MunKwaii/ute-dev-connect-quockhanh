const notificationService = require('../services/notificationService');

// @desc    Lấy danh sách thông báo
const getNotifications = async (req, res) => {
  try {
    const notifications = await notificationService.getNotifications(req.user.id);
    res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi Server'
    });
  }
};

// @desc    Đếm số lượng thông báo chưa đọc
const getUnreadCount = async (req, res) => {
  try {
    const count = await notificationService.getUnreadCount(req.user.id);
    res.status(200).json({
      success: true,
      data: { count }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi Server'
    });
  }
};

// @desc    Đánh dấu một thông báo là đã đọc
const markAsRead = async (req, res) => {
  try {
    const notification = await notificationService.markAsRead(req.params.id, req.user.id);
    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (err) {
    console.error(err.message);
    if (err.statusCode === 404 || err.statusCode === 401) {
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

// @desc    Đánh dấu tất cả thông báo là đã đọc
const markAllAsRead = async (req, res) => {
  try {
    const result = await notificationService.markAllAsRead(req.user.id);
    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi Server'
    });
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
};
