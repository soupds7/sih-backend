const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const ChatModel = require('./models/chatModel');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// POST /chat/message
app.post('/chat/message', async (req, res) => {
  const { userId, text, sender } = req.body;
  if (!userId || !text || !sender) return res.status(400).json({ error: 'userId, text, and sender required' });

  let chat = await ChatModel.findOne({ userId });
  if (!chat) chat = new ChatModel({ userId, messages: [] });

  // Save user message
  const messageObj = { sender, text };
  if (sender === 'bot') messageObj.senderId = 'bot_001';
  else messageObj.senderId = userId;

  chat.messages.push(messageObj);
  await chat.save();

  // If the sender is user, call n8n and save bot reply
  if (sender === 'user') {
    try {
      const n8nRes = await axios.post('https://dsense.app.n8n.cloud/webhook-test/register', {
        message: text,
        userId: userId
      });
      // Adjust this line based on your n8n response structure
      const botReply = n8nRes.data.output || n8nRes.data.reply || '';
      if (botReply) {
        chat.messages.push({ sender: 'bot', text: botReply, senderId: 'bot_001' });
        await chat.save();
      }
    } catch (err) {
      // Optionally handle error, but don't save "No reply"
    }
  }

  res.json({ messages: chat.messages });
});

// GET /chat/history/:userId
app.get('/chat/history/:userId', async (req, res) => {
  const { userId } = req.params;
  const chat = await ChatModel.findOne({ userId });
  res.json({ messages: chat ? chat.messages : [] });
});

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
  .catch(err => console.error("MongoDB connection error:", err));

