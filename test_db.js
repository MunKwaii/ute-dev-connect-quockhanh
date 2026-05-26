const mongoose = require("mongoose"); 
require("dotenv").config(); 
mongoose.connect(process.env.DATABASE_URL).then(async () => { 
  require("./src/models/User"); // REGISTER USER SCHEMA
  const Conversation = require("./src/models/Conversation"); 
  const id = new mongoose.Types.ObjectId("651a3a1b2c3d4e5f60718290"); 
  const convs = await Conversation.find({ participants: { $in: [id] } }).populate("participants"); 
  console.log("Convs for 651a3a1b2c3d4e5f60718290:", convs.length); 
  process.exit(0); 
})
