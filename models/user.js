// src/models/your_model.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId:mongoose.Types.ObjectId,
  userType:String,
  email: String,
  gender: String,
  firstname: String,
  city: String,
  phone: String,
  address: String,
  state: String,
  zip: String,
  dob: String,
});

const userModel = mongoose.model('users', userSchema);

module.exports = userModel;

