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
  const { userId, text } = req.body;
  if (!userId || !text) return res.status(400).json({ error: 'userId and text required' });

  // 1. Save user message
  let chat = await ChatModel.findOne({ userId });
  if (!chat) chat = new ChatModel({ userId, messages: [] });
  chat.messages.push({ sender: 'user', text });
  await chat.save();

  // 2. Call n8n webhook for AI reply
  let botReply = "No reply";
  try {
    const n8nRes = await axios.post('https://dsense.app.n8n.cloud/webhook/register', { message: text });
    // Adjust this line based on your n8n response structure:
    botReply =
      (n8nRes.data.data &&
        n8nRes.data.data[0] &&
        n8nRes.data.data[0].json &&
        n8nRes.data.data[0].json.output) ||
      n8nRes.data.reply ||
      n8nRes.data.output ||
      "No reply";
  } catch (err) {
    botReply = "Bot is unavailable.";
  }

  // 3. Save bot reply
  chat.messages.push({ sender: 'bot', text: botReply });
  await chat.save();

  // 4. Return updated messages
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