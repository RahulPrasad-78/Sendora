const mongoose = require("mongoose");

const TailoredResumeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      default: "Tailored Software Engineer Resume",
    },
    jobDescription: {
      type: String,
      required: true,
    },
    targetRole: {
      type: String,
      default: "Software Engineer",
      trim: true,
    },
    company: {
      type: String,
      default: "",
      trim: true,
    },
    latexContent: {
      type: String,
      required: true,
    },
    pdfBase64: {
      type: String,
      default: "",
    },
    pdfFileName: {
      type: String,
      default: "tailored_resume.pdf",
    },
    summary: {
      type: String,
      default: "",
    },
    keySkills: {
      type: [String],
      default: [],
    },
    selectedProjects: {
      type: [String],
      default: [],
    },
    projectCount: {
      type: Number,
      default: 2,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("TailoredResume", TailoredResumeSchema);
