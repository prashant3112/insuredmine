// src/models/your_model.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    message: String,
    scheduledTime: Date
  });
  
const Message = mongoose.model('Message', messageSchema);
module.exports = Message;