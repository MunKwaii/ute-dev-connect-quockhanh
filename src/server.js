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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
});