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
    jobRequirement: {
      type: String,
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
    linkedin: {
      type: String,
      trim: true,
    },
    github: {
      type: String,
      trim: true,
    },
    leetcode: {
      type: String,
      trim: true,
    },
    resumeLink: {
      type: String,
      trim: true,
    },
    attachedResumeTitle: {
      type: String,
      trim: true,
      default: "",
    },
    attachedResumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TailoredResume",
      default: null,
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

