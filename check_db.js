const mongoose = require('mongoose');
const Conversation = require('./src/models/Conversation');
const Message = require('./src/models/Message');
const User = require('./src/models/User');

require('dotenv').config();

async function checkDB() {
  await mongoose.connect(process.env.DATABASE_URL);
  console.log("Connected to MongoDB.");
  
  const convs = await Conversation.find().populate('participants');
  console.log("Conversations:", JSON.stringify(convs, null, 2));

  const msgs = await Message.find();
  console.log("Messages count:", msgs.length);
  
  process.exit(0);
}

checkDB();
