const EmailLog = require("../models/EmailLog");
const { generateEmail } = require("../services/aiService");
const { sendEmail } = require("../services/emailService");

const getEmailLogs = async (req, res) => {
  try {
    const emailLogs = await EmailLog.find().sort({ sentAt: -1 }).limit(50);
    res.status(200).json(emailLogs);
  } catch (error) {
    res.status(200).json([]);
  }
};

const createEmailLog = async (req, res) => {
  try {
    const emailLog = await EmailLog.create(req.body);
    res.status(201).json(emailLog);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const generateAIResponse = async (req, res) => {
  try {
    const { jobRequirement, recruiterName } = req.body;

    if (!jobRequirement) {
      return res.status(400).json({ message: "jobRequirement is required" });
    }

    const generatedEmail = await generateEmail({
      jobRequirement,
      recruiterName: recruiterName || "Hiring Manager",
    });

    return res.status(200).json(generatedEmail);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to generate email", error: error.message });
  }
};

const createEmailLogRecord = async (payload) => {
  try {
    const emailLog = await EmailLog.create(payload);
    return { emailLog, error: null };
  } catch (error) {
    return { emailLog: null, error };
  }
};

const sendRecruiterEmail = async (req, res) => {
  const {
    recruiterName,
    recruiterEmail,
    jobRequirement,
    subject,
    body,
    senderName,
    linkedin,
    resumeLink,
    github,
    leetcode,
  } = req.body;

  if (!recruiterEmail || !subject || !body) {
    return res.status(400).json({
      message: "recruiterEmail, subject, and body are required",
    });
  }

  try {
    const mailResult = await sendEmail({
      to: recruiterEmail,
      subject,
      body,
      senderName,
      linkedin,
      resumeLink,
      github,
      leetcode,
    });

    const { emailLog } = await createEmailLogRecord({
      recruiterName,
      recruiterEmail,
      jobRequirement,
      subject,
      body,
      linkedin,
      github,
      leetcode,
      resumeLink,
      status: "Success",
    });

    return res.status(200).json({
      message: "Email sent successfully via Nodemailer!",
      messageId: mailResult ? mailResult.messageId : null,
      emailLog: emailLog || {
        recruiterName,
        recruiterEmail,
        jobRequirement,
        subject,
        status: "Success",
        sentAt: new Date(),
      },
    });
  } catch (error) {
    await createEmailLogRecord({
      recruiterName,
      recruiterEmail,
      jobRequirement,
      subject,
      body,
      status: "Failed",
      error: error.message,
    });

    return res.status(500).json({
      message: "Failed to send email via Nodemailer: " + error.message,
      error: error.message,
    });
  }
};

module.exports = {
  getEmailLogs,
  createEmailLog,
  generateAIResponse,
  sendRecruiterEmail,
};

