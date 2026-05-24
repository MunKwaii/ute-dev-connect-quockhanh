require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');


const app = express();

connectDB();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('API Mạng xã hội đang chạy trên Database Online!');
});

// Đăng ký routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api', require('./routes/profileRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));

const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Tạm thời allow all origin để test frontend dễ dàng
    methods: ['GET', 'POST'],
  },
});

const Message = require('./models/Message');
const Conversation = require('./models/Conversation');

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_room', (conversationId) => {
    socket.join(conversationId);
    console.log(`User ${socket.id} joined room: ${conversationId}`);
  });

  socket.on('send_message', async (data) => {
    try {
      const { conversationId, senderId, text } = data;
      
      // Lưu tin nhắn vào DB
      const newMessage = new Message({ conversationId, sender: senderId, text });
      await newMessage.save();

      // Cập nhật lastMessage cho Conversation
      await Conversation.findByIdAndUpdate(conversationId, { lastMessage: newMessage._id });

      // Populate thông tin người gửi để frontend hiển thị
      await newMessage.populate('sender', 'name avatar');

      // Gửi tin nhắn cho tất cả user trong room
      io.to(conversationId).emit('receive_message', newMessage);
    } catch (err) {
      console.error('Lỗi khi gửi tin nhắn:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
});