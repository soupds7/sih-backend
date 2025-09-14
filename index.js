const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const userRoutes = require('./routes/userRoutes')

require('dotenv').config();

const app = express();


app.use(express.json());
app.use(cors());


mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/user", userRoutes);



const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});