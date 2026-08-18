const mongoose = require("mongoose");

const categorizedEmailSchema = new mongoose.Schema(
  {
    senderName: {
      type: String,
      trim: true,
      default: "Unknown Sender",
    },
    senderEmail: {
      type: String,
      trim: true,
      default: "",
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    rawContent: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: [
        "Interview Invitation",
        "Job Offer / Assessment",
        "Recruiter Outreach / Lead",
        "Action / Follow-Up Needed",
        "Application Rejection",
        "Newsletter & General",
        "Spam / Irrelevant",
      ],
      required: true,
    },
    priority: {
      type: String,
      enum: ["P1", "P2", "P3", "P4", "P5", "P0"],
      default: "P3",
    },
    confidenceScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 90,
    },
    summary: {
      type: String,
      trim: true,
      default: "",
    },
    actionRequired: {
      type: String,
      trim: true,
      default: "None",
    },
    deadline: {
      type: String,
      trim: true,
      default: "None",
    },
    sentiment: {
      type: String,
      enum: ["Positive", "Neutral", "Urgent", "Rejection", "Negative"],
      default: "Neutral",
    },
    suggestedReply: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["Unread", "Read", "Replied", "Archived"],
      default: "Unread",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("CategorizedEmail", categorizedEmailSchema);
