const express = require("express");
const {
  createEmailLog,
  generateAIResponse,
  getEmailLogs,
  sendRecruiterEmail,
} = require("../controllers/emailController");
const { requireOwner } = require("../middleware/authMiddleware");
const { aiLimiter } = require("../middleware/rateLimiters");

const router = express.Router();

router.post("/generate", aiLimiter, generateAIResponse);
router.post("/send", requireOwner, sendRecruiterEmail);
router.get("/", getEmailLogs);
router.post("/", requireOwner, createEmailLog);

module.exports = router;
