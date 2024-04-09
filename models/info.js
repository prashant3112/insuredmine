// src/models/your_model.js
const mongoose = require("mongoose");

const infoSchema = new mongoose.Schema({
  userId: mongoose.Types.ObjectId,
  policy_mode: String,
  policy_number: String,
  premium_amount_written: String,
  premium_amount: String,
  policy_type: String,
  companyId: mongoose.Types.ObjectId,
  categoryId: mongoose.Types.ObjectId,
  policy_start_date: String,
  policy_end_date: String,
});

const infoModel = mongoose.model("policy", infoSchema);

module.exports = infoModel;
