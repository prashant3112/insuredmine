// src/models/your_model.js
const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  userId:mongoose.Types.ObjectId,
  account_name: String,
});

const accountModel = mongoose.model("user's account", accountSchema);

module.exports = accountModel;

