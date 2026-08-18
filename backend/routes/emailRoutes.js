const express = require("express");
const {
  createEmailLog,
  generateAIResponse,
  getEmailLogs,
  sendRecruiterEmail,
} = require("../controllers/emailController");

const router = express.Router();

router.post("/generate", generateAIResponse);
router.post("/send", sendRecruiterEmail);
router.get("/", getEmailLogs);
router.post("/", createEmailLog);

module.exports = router;
