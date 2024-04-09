// src/models/your_model.js
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  userId:mongoose.Types.ObjectId,
  category_name:String,
});

const categoryModel = mongoose.model('LOB', categorySchema);

module.exports = categoryModel;

