const { parentPort, workerData } = require("worker_threads");
const mongoose = require("mongoose");
const insureModel = require("../models/fulldata"); // Define your Mongoose model here
const { filePath } = workerData;
const csv = require("csv-parser");
const fs = require("fs");

const results = [];

fs.createReadStream(filePath)
  .pipe(csv())
  .on("data", (data) => {
    //console.log(data);
    const rowData = {
      agent: data.agent,
      userType: data.userType,
      policy_mode: data.policy_mode,
      producer: data.producer,
      policy_number: data.policy_number,
      premium_amount_written: data.premium_amount_written,
      premium_amount: data.premium_amount,
      policy_type: data.policy_type,
      company_name: data.company_name,
      category_name: data.category_name,
      policy_start_date: data.policy_start_date,
      policy_end_date: data.policy_end_date,
      csr: data.csr,
      account_name: data.account_name,
      email: data.email,
      gender: data.gender,
      firstname: data.firstname,
      city: data.city,
      account_type: data.account_type,
      phone: data.phone,
      address: data.address,
      state: data.state,
      zip: data.zip,
      dob: data.dob,
      // Add more columns as needed
    };
    results.push(rowData);
  })
  .on("end", async () => {
    try {
      const mongoURI = "mongodb://0.0.0.0:27017/insuredmine"; // Update with your MongoDB URI
      await mongoose.connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000, // Adjust timeout value as needed
        socketTimeoutMS: 60000, // Adjust timeout value as needed (e.g., 60 seconds)
      });

      await insureModel.insertMany(results, { timeout: 30000 });
      console.log("Data inserted successfully");

      mongoose.disconnect(); // Close the MongoDB connection

      parentPort.postMessage({ success: true });

    } catch (error) {
      console.error(error);
      parentPort.postMessage({ success: false, error: error.message });
    }
  })
  .on("error", (error) => {
    console.error(error);
    parentPort.postMessage({ success: false, error: error.message });
  });
