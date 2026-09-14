const express = require("express");
const {
  createEmailLog,
  generateAIResponse,
  getEmailLogs,
  sendRecruiterEmail,
} = require("../controllers/emailController");
const { requireOwner } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/generate", generateAIResponse);
router.post("/send", requireOwner, sendRecruiterEmail);
router.get("/", getEmailLogs);
router.post("/", requireOwner, createEmailLog);

module.exports = router;
