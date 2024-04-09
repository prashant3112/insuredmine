// src/models/your_model.js
const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
  agentId:mongoose.Types.ObjectId,
  agent: String,
  
});

const agentModel = mongoose.model('agent', agentSchema);

module.exports = agentModel;

