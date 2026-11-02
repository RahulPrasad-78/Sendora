const mongoose = require("mongoose");

// Fail queries immediately when disconnected instead of buffering for 10s, so the
// controllers' in-memory fallbacks kick in right away.
mongoose.set("bufferCommands", false);

const RECONNECT_COOLDOWN_MS = 15000;
let lastFailedAttempt = 0;
let connecting = null;

const connectDB = async () => {
  if (mongoose.connection && mongoose.connection.readyState >= 1) {
    return;
  }
  if (!process.env.MONGO_URI) {
    return;
  }
  if (connecting) {
    return connecting;
  }
  // Don't make every request wait on a 5s connect attempt while the DB is down.
  if (Date.now() - lastFailedAttempt < RECONNECT_COOLDOWN_MS) {
    return;
  }
  connecting = mongoose
    .connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    })
    .then(() => {
      console.log("MongoDB Connected");
    })
    .catch((error) => {
      lastFailedAttempt = Date.now();
      console.warn("Warning: Could not connect to MongoDB. In-memory fallbacks will be used. Error:", error.message);
    })
    .finally(() => {
      connecting = null;
    });
  return connecting;
};

if (!process.env.MONGO_URI) {
  console.warn("Notice: MONGO_URI is not set. Sendora will run with in-memory fallbacks.");
}

module.exports = connectDB;
