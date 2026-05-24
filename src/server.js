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

const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Tạm thời allow all origin để test frontend dễ dàng
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
});