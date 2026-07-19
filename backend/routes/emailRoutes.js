const express = require("express");
const {
  createEmailLog,
  generateAIResponse,
  getEmailLogs,
} = require("../controllers/emailController");

const router = express.Router();

router.post("/generate", generateAIResponse);
router.get("/", getEmailLogs);
router.post("/", createEmailLog);

module.exports = router;
