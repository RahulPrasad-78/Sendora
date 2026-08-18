const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
  } catch (error) {
    console.warn("Warning: Could not connect to MongoDB. Email generation and sending will proceed without database logging. Error:", error.message);
  }
};

module.exports = connectDB;

