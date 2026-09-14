const mongoose = require("mongoose");

const masterResumeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "Master ATS LaTeX Resume",
      trim: true,
    },
    latexContent: {
      type: String,
      required: true,
    },
    clsContent: {
      type: String,
      default: "",
    },
    isDefault: {
      type: Boolean,
      default: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MasterResume", masterResumeSchema);

