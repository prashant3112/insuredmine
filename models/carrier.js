// src/models/your_model.js
const mongoose = require("mongoose");

const carrierSchema = new mongoose.Schema({
  userId: mongoose.Types.ObjectId,
  company_name: String,
});

const carrierModel = mongoose.model("carrier", carrierSchema);

module.exports = carrierModel;
