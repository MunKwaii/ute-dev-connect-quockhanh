const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GroupSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  avatar: {
    type: String,
    default: ''
  },
  // Người tạo nhóm / quản trị viên
  admin: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  // Danh sách thành viên (bao gồm cả admin)
  members: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: 'user'
      },
      joinedAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  // Tag công nghệ của nhóm (vd: 'react', 'nodejs')
  tags: {
    type: [String],
    default: []
  },
  // Soft delete: isActive = false thay vì xóa thật
  isActive: {
    type: Boolean,
    default: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('group', GroupSchema);
