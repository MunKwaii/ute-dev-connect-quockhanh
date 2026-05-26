const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const notificationController = require('../controllers/notificationController');

// @route   GET /api/notifications
// @desc    Lấy danh sách thông báo của user
// @access  Private
router.get('/', verifyToken, notificationController.getNotifications);

// @route   GET /api/notifications/unread-count
// @desc    Lấy số lượng thông báo chưa đọc
// @access  Private
router.get('/unread-count', verifyToken, notificationController.getUnreadCount);

// @route   PUT /api/notifications/:id/read
// @desc    Đánh dấu một thông báo là đã đọc
// @access  Private
router.put('/:id/read', verifyToken, notificationController.markAsRead);

// @route   PUT /api/notifications/read-all
// @desc    Đánh dấu tất cả thông báo là đã đọc
// @access  Private
router.put('/read-all', verifyToken, notificationController.markAllAsRead);

module.exports = router;
