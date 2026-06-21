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
  codeLanguage: {
    type: String,
    default: 'javascript'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
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
  isQuestion: {
    type: Boolean,
    default: false
  },
  acceptedAnswer: {
    type: Schema.Types.ObjectId,
    default: null
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
        type: Schema.Types.ObjectId,
        ref: 'user'
      },
      text: {
        type: String,
        required: true
      },
      codeSnippet: {
        type: String,
        default: ''
      },
      codeLanguage: {
        type: String,
        default: 'javascript'
      },
      approvals: [
        {
          user: {
            type: Schema.Types.ObjectId,
            ref: 'user'
          }
        }
      ],
      name: {
        type: String
      },
      avatar: {
        type: String
      },
      date: {
        type: Date,
        default: Date.now
      },
      isAccepted: {
        type: Boolean,
        default: false
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
