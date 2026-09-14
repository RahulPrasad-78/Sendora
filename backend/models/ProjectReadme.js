const mongoose = require("mongoose");

const projectReadmeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
    },
    tagline: {
      type: String,
      trim: true,
      default: "",
    },
    techStack: {
      type: [String],
      default: [],
    },
    content: {
      type: String,
      required: true,
    },
    repoUrl: {
      type: String,
      trim: true,
      default: "",
    },
    liveUrl: {
      type: String,
      trim: true,
      default: "",
    },
    isFeatured: {
      type: Boolean,
      default: true,
    },
    source: {
      type: String,
      enum: ["manual", "github_import", "disk_seeded"],
      default: "manual",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProjectReadme", projectReadmeSchema);

