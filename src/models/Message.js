const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    text: {
      type: String,
      required: false,
    },
    fileUrl: {
      type: String,
      required: false,
    },
    fileName: {
      type: String,
      required: false,
    },
    fileType: {
      type: String, // 'image' | 'file'
      required: false,
    },
    codeSnippet: {
      code: { type: String },
      language: { type: String }
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);
