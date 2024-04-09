// src/server.js
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const exceljs = require("exceljs");
const path = require("path");
const { Worker } = require("worker_threads");
const agentModel = require("../models/agent");
const insureModel = require("../models/fulldata");
const userModel = require("../models/user");
const accountModel = require("../models/account");
const categoryModel = require("../models/category");
const carrierModel = require("../models/carrier");
const { ObjectId } = require("mongodb");
const infoModel = require("../models/info");
const bodyParser = require('body-parser');

const pidusage = require('pidusage');
const { exec } = require('child_process');
const Message = require("../models/message");

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection setup

const mongoURI = "mongodb://0.0.0.0:27017/insuredmine"; // Update with your MongoDB URI
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Adjust timeout value as needed
  socketTimeoutMS: 60000, // Adjust timeout value as needed (e.g., 60 seconds)
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
  process.exit(1); // Exit the process if MongoDB connection fails
});

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, File, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, File, cb) {
    cb(
      null,
      File.fieldname + "-" + Date.now() + path.extname(File.originalname)
    );
  },
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

app.post(
  "/upload",
  (req, res, next) => {
    upload.single("File")(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        console.log(err);
        return res.status(400).json({ error: "Multer error" });
      } else if (err) {
        // An unknown error occurred.
        console.log(err);
        return res.status(500).json({ error: "Unknown error" });
      }
      // Everything went fine.
      next();
    });
  },
  async (req, res) => {
    const filePath = req.file.path;
    const fileName = req.file.filename;

    // Call worker thread to process file
    const worker = new Worker(path.join(__dirname, "worker.js"), {
      workerData: { filePath, fileName },
    });

    worker.postMessage({ filePath, fileName });

    worker.on("message", async (data) => {
      res
        .status(200)
        .json({ message: "File uploaded successfully", data: data });
    });

    worker.on("error", (err) => {
      // Handle errors
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    });
  }
);

// api for making different collection from whole data column
app.get("/transferData", async (req, res) => {
  try {
    // Fetch data from the original collection
    const data = await insureModel.find();
    const policyData = [];
    const agentData = [];
    const userData = [];
    const accountData = [];
    const categoryData = [];
    const carrierData = [];

    data.forEach((item) => {
      const agentItem = {
        agentId: item._id,
        agent: item.agent,
      };
      agentData.push(agentItem);

      const userItem = {
        userId: item._id,
        userType: item.userType,
        email: item.email,
        gender: item.gender,
        firstname: item.firstname,
        city: item.city,
        phone: item.phone,
        address: item.address,
        state: item.state,
        zip: item.zip,
        dob: item.dob,
      };
      userData.push(userItem);

      const accountItem = {
        userId: item._id,
        account_name: item.account_name,
      };
      accountData.push(accountItem);

      const categoryItem = {
        userId: item._id,
        category_name: item.category_name,
      };
      categoryData.push(categoryItem);

      const carrierItem = {
        userId: item._id,
        company_name: item.company_name,
      };
      carrierData.push(carrierItem);
    });

    await userModel.insertMany(userData);
    await agentModel.insertMany(agentData);
    await accountModel.insertMany(accountData);
    await categoryModel.insertMany(categoryData);
    await carrierModel.insertMany(carrierData);

    const infodata = await categoryModel.find();
    const companydata = await carrierModel.find();

    data.forEach((item) => {
      const infoObjectId = new ObjectId(item._id);
      const infoObject = infodata.find((item) =>
        item.userId.equals(infoObjectId)
      );

      const companyObjectId = new ObjectId(item._id);
      const companyObject = companydata.find((item) =>
        item.userId.equals(companyObjectId)
      );

      const policyItem = {
        userId: item._id,
        policy_mode: item.policy_mode,
        policy_number: item.policy_number,
        premium_amount_written: item.premium_amount_written,
        premium_amount: item.premium_amount,
        policy_type: item.policy_type,
        companyId: companyObject._id,
        categoryId: infoObject._id,
        policy_start_date: item.policy_start_date,
        policy_end_date: item.policy_end_date,
      };
      policyData.push(policyItem);
    });

    await infoModel.insertMany(policyData);

    res.status(200).json({ message: "Data transferred successfully" });
  } catch (error) {
    console.error("Error transferring data:", error);
    res.status(500).json({ error: "Error transferring data" });
  }
});

// Search API to find policy info with the help of the username.

app.get("/search", async (req, res) => {
  try {
    // const firstname = req.query.firstname;

    // // Find the user by their firstname
    // const user = await userModel.findOne({ "firstname": firstname });

    // if (!user) {
    //   return res.status(404).json({ message: "User not found" });
    // }

    // // Once you have the userId, find the policy info associated with that userId
    // const policyInfo = await infoModel.findOne({ "userId": user.userId });

    // if (!policyInfo) {
    //   return res.status(404).json({ message: "Policy info not found for the user" });
    // }

    // res.status(200).json(policyInfo);

    const firstname = req.query.firstname;
    const userPolicyInfo = await userModel.aggregate([
        {
            $match: { firstname } // Filter users by username
        },
        {
            $lookup: {
                from: "policies", // Assuming the name of the infoModel collection
                localField: "userId",
                foreignField: "userId",
                as: "policyInfo"
            }
        },

    ]);

    // If no user found, return 404
    if (userPolicyInfo.length === 0) {
        return res.status(404).json({ message: "User not found" });
    }

    // Return the policy info for the user
    res.status(200).json(userPolicyInfo[0]);

    
  } catch (error) {
    // Handle errors
    console.error("Error searching policy info:", error);
    res.status(500).json({ error: "Error searching policy info" });
  }
});

// API to provide aggregated policy by each user.

app.get("/aggregate", async (req, res) => {
  try {
    const aggregatedPolicies = await userModel.aggregate([
      {
        $lookup: {
          from: "policies",
          localField: "userId",
          foreignField: "userId",
          as: "policies",
        },
      },
    ]);

    res.status(200).json(aggregatedPolicies);
  } catch (error) {
    console.error("Error aggregating policy info:", error);
    res.status(500).json({ error: "Error aggregating policy info" });
  }
});

app.use(bodyParser.json());

app.post('/schedule-message', async (req, res) => {
    try {

      const { message, day, time } = req.body;
  
      // Construct scheduled time from day and time
      const scheduledTime = new Date(`${day}T${time}`);
  
      // Save the message with scheduled time to the database
      await Message.create({ message, scheduledTime });
  
      res.status(201).json({ message: 'Message scheduled successfully' });
    } catch (error) {
      console.error('Error scheduling message:', error);
      res.status(500).json({ error: 'Error scheduling message' });
    }
  });





// Function to restart the server
const restartServer = () => {
  console.log('Restarting server...');
  exec('pm2 restart yourApp', (error, stdout, stderr) => {
    if (error) {
      console.error('Error restarting server:', error);
    } else {
      console.log('Server restarted successfully.');
    }
  });
};

// Function to monitor CPU usage
const monitorCPU = () => {
  setInterval(() => {
    pidusage(process.pid, (err, stats) => {
      if (err) {
        console.error('Error retrieving CPU usage:', err);
        return;
      }
      console.log('CPU usage:', stats.cpu);
      if (stats.cpu > 70) {
        restartServer();
      }
    });
  }, 5000); // Check CPU usage every 5 seconds
};

// Start CPU monitoring
monitorCPU();


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
