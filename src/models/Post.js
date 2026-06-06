const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId
  },
  text: {
    type: String,
    required: true
  },
  codeSnippet: {
    type: String
  },
  tags: {
    type: [String],
    default: []
  },
  group: {
    type: Schema.Types.ObjectId,
    ref: 'group',
    default: null
  },
  name: {
    type: String
  },
  avatar: {
    type: String
  },
  likes: [
    {
      user: {
        type: Schema.Types.ObjectId
      }
    }
  ],
  comments: [
    {
      user: {
        type: Schema.Types.ObjectId
      },
      text: {
        type: String,
        required: true
      },
      name: {
        type: String
      },
      avatar: {
        type: String
      },
      date: {
        type: Date,
        default: Date.now
      }
    }
  ],
  date: {
    type: Date,
    default: Date.now
  }
});

// Text index cho Full-text search (chỉ được có 1 text index per collection)
PostSchema.index({ text: 'text', tags: 'text' });

module.exports = mongoose.model('post', PostSchema);
