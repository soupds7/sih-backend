const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Unique per user (could be email, uuid, etc.)
  messages: [
    {
      sender: { type: String, enum: ['user', 'bot'], required: true },
      text: { type: String, required: true },
      timestamp: { type: Date, default: Date.now }
    }
  ]
});

module.exports = mongoose.model('Chat', chatSchema);