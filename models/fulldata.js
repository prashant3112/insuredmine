// src/models/your_model.js
const mongoose = require('mongoose');

const insureSchema = new mongoose.Schema({
  agent: String,
  userType: String,
  policy_mode: String,
  producer: String,
  policy_number: String,
  premium_amount_written: String,
  premium_amount:String,
  policy_type: String,
  company_name: String,
  category_name:String,
  policy_start_date: String,
  policy_end_date: String,
  csr: String,
  account_name: String,
  email: String,
  gender: String,
  firstname: String,
  city: String,
  account_type: String,
  phone: String,
  address: String,
  state: String,
  zip: String,
  dob: String,
});

const insureModel = mongoose.model('insurance', insureSchema);

module.exports = insureModel;

