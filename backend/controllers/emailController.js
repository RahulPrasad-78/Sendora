const EmailLog = require("../models/EmailLog");
const { generateEmail } = require("../services/aiService");

const getEmailLogs = async (req, res) => {
  try {
    const emailLogs = await EmailLog.find().sort({ sentAt: -1 });
    res.status(200).json(emailLogs);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve email logs", error: error.message });
  }
};

const createEmailLog = async (req, res) => {
  try {
    const emailLog = await EmailLog.create(req.body);
    res.status(201).json(emailLog);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    res
      .status(500)
      .json({ message: "Failed to create email log", error: error.message });
  }
};

const generateAIResponse = async (req, res) => {
  try {
    const { recruiterName } = req.body;

    if (!recruiterName) {
      return res.status(400).json({ message: "recruiterName is required" });
    }

    const generatedEmail = await generateEmail(recruiterName);
    return res.status(200).json(generatedEmail);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to generate email", error: error.message });
  }
};

module.exports = {
  getEmailLogs,
  createEmailLog,
  generateAIResponse,
};
