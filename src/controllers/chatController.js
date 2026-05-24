const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// Lấy danh sách phòng chat của user hiện tại
exports.getConversations = async (req, res) => {
  try {
    console.log("=> GET /chat/conversations, req.user.id:", req.user.id);
    const mongoose = require('mongoose');
    const objectId = new mongoose.Types.ObjectId(req.user.id);
    
    const conversations = await Conversation.find({
      participants: { $in: [objectId] }
    })
      .populate('participants', 'name avatar email')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    console.log("=> Found conversations count:", conversations.length);
    if (conversations.length > 0) {
      console.log("=> First conversation ID:", conversations[0]._id);
    }
    res.status(200).json(conversations);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách phòng chat:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Lấy lịch sử tin nhắn của một phòng chat
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const mongoose = require('mongoose');
    const objectId = new mongoose.Types.ObjectId(req.user.id);

    // Kiểm tra xem phòng chat có tồn tại và user có nằm trong phòng đó không
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: objectId
    });

    if (!conversation) {
      return res.status(403).json({ message: 'Bạn không có quyền truy cập hoặc phòng chat không tồn tại' });
    }

    const messages = await Message.find({ conversationId })
      .populate('sender', 'name avatar')
      .sort({ createdAt: 1 }); // Xếp từ cũ đến mới để dễ hiển thị trên UI

    res.status(200).json(messages);
  } catch (error) {
    console.error('Lỗi khi lấy lịch sử tin nhắn:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Tạo hoặc lấy phòng chat 1-1 với một user khác
exports.createOrGetConversation = async (req, res) => {
  try {
    const { userId } = req.params; // ID của người muốn chat cùng
    const currentUserId = req.user.id;
    const mongoose = require('mongoose');
    const objectCurrentId = new mongoose.Types.ObjectId(currentUserId);
    const objectUserId = new mongoose.Types.ObjectId(userId);

    // Kiểm tra xem đã có conversation giữa 2 người chưa
    let conversation = await Conversation.findOne({
      participants: { $all: [objectCurrentId, objectUserId] }
    }).populate('participants', 'name avatar email');

    if (!conversation) {
      // Nếu chưa có, tạo mới
      conversation = new Conversation({
        participants: [objectCurrentId, objectUserId]
      });
      await conversation.save();
      
      // Populate thông tin participant sau khi lưu
      conversation = await Conversation.findById(conversation._id).populate('participants', 'name avatar email');
    }

    res.status(200).json(conversation);
  } catch (error) {
    console.error('Lỗi khi tạo/lấy phòng chat:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};
