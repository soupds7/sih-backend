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

  // Add senderId for bot if needed
  const messageObj = { sender, text };
  if (sender === 'bot') messageObj.senderId = 'bot_001';
  else messageObj.senderId = userId;

  chat.messages.push(messageObj);
  await chat.save();

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