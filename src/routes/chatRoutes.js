const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const chatController = require('../controllers/chatController');

// @route   GET /api/chat/conversations
// @desc    Lấy danh sách các phòng chat của user hiện tại
// @access  Private
router.get('/conversations', verifyToken, chatController.getConversations);

// @route   GET /api/chat/:conversationId/messages
// @desc    Lấy lịch sử tin nhắn của một phòng chat
// @access  Private
router.get('/:conversationId/messages', verifyToken, chatController.getMessages);

// @route   POST /api/chat/:userId
// @desc    Tạo hoặc lấy phòng chat với một user khác
// @access  Private
router.post('/:userId', verifyToken, chatController.createOrGetConversation);

module.exports = router;
