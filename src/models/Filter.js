const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FilterSchema = new Schema({
  bannedWords: {
    type: [String],
    default: []
  },
  aiFilterEnabled: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('filter', FilterSchema);
