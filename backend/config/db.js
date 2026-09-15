const mongoose = require("mongoose");

const connectDB = async () => {
  if (mongoose.connection && mongoose.connection.readyState >= 1) {
    return;
  }
  if (!process.env.MONGO_URI) {
    console.warn("Notice: MONGO_URI is not set. Sendora will run with in-memory fallbacks.");
    return;
  }
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("MongoDB Connected");
  } catch (error) {
    console.warn("Warning: Could not connect to MongoDB. In-memory fallbacks will be used. Error:", error.message);
  }
};

module.exports = connectDB;

