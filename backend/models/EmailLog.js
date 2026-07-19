const mongoose = require("mongoose");

const emailLogSchema = new mongoose.Schema(
  {
    recruiterName: {
      type: String,
      trim: true,
    },
    recruiterEmail: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["Success", "Failed"],
      default: "Success",
    },
    error: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("EmailLog", emailLogSchema);
