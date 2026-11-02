const express = require("express");
const {
  generateResume,
  getResumes,
  getResumeById,
  downloadResumePdf,
  deleteResume,
  getResumeStatus,
  updateAndRecompileResume,
} = require("../controllers/resumeController");
const { requireOwner } = require("../middleware/authMiddleware");
const { aiLimiter } = require("../middleware/rateLimiters");

const router = express.Router();

router.post("/generate", aiLimiter, generateResume);
router.post("/recompile", requireOwner, updateAndRecompileResume);
router.put("/:id", requireOwner, updateAndRecompileResume);
router.get("/status", getResumeStatus);
router.get("/", requireOwner, getResumes);
router.get("/:id", getResumeById);
router.get("/:id/pdf", downloadResumePdf);
router.delete("/:id", requireOwner, deleteResume);

module.exports = router;
