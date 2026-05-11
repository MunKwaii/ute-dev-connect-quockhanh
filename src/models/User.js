const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
    isEmailVerified: {
    type: Boolean,
    default: false
  },
  studentId: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  savedPosts: [
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'post'
    }
  ],
  avatar: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user' // Mặc định tạo tài khoản sẽ là user
  }
});


module.exports = mongoose.model('user', UserSchema);
