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

const TailoredResume = require("../models/TailoredResume");
const { buildTailoredResume } = require("../services/resumeService");

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
    attachResume,
    resumeMode,
    selectedResumeId,
    newResumeData,
  } = req.body;

  if (!recruiterEmail || !subject || !body) {
    return res.status(400).json({
      message: "recruiterEmail, subject, and body are required",
    });
  }

  const attachments = [];
  let attachedResumeTitle = "";
  let attachedResumeId = null;

  try {
    if (attachResume) {
      if (resumeMode === "existing" && selectedResumeId) {
        // Fetch from MongoDB
        const existingResume = await TailoredResume.findById(selectedResumeId);
        if (existingResume && existingResume.pdfBase64) {
          const pdfBuffer = Buffer.from(existingResume.pdfBase64, "base64");
          const filename = existingResume.pdfFileName || `${existingResume.title || "Tailored_Resume"}.pdf`;
          attachments.push({
            filename,
            content: pdfBuffer,
            contentType: "application/pdf",
          });
          attachedResumeTitle = existingResume.title || filename;
          attachedResumeId = existingResume._id;
        }
      } else if (resumeMode === "new") {
        if (newResumeData && newResumeData.pdfBase64) {
          const pdfBuffer = Buffer.from(newResumeData.pdfBase64, "base64");
          const filename = newResumeData.pdfFileName || "Tailored_Resume.pdf";
          attachments.push({
            filename,
            content: pdfBuffer,
            contentType: "application/pdf",
          });
          attachedResumeTitle = newResumeData.title || filename;
          attachedResumeId = newResumeData._id || null;
        } else if (jobRequirement) {
          // Generate new tailored resume on the fly and save to MongoDB
          const generated = await buildTailoredResume({ jobDescription: jobRequirement });
          let savedResume = null;
          try {
            savedResume = await TailoredResume.create({
              title: generated.title,
              jobDescription: jobRequirement,
              targetRole: generated.targetRole,
              company: generated.company,
              latexContent: generated.latexContent,
              pdfBase64: generated.pdfBase64,
              pdfFileName: generated.pdfFileName,
              summary: generated.summary,
              keySkills: generated.keySkills,
              selectedProjects: generated.selectedProjects,
            });
            attachedResumeId = savedResume._id;
          } catch (dbErr) {
            console.warn("Could not save auto-generated resume to MongoDB:", dbErr.message);
          }
          if (generated.pdfBuffer) {
            attachments.push({
              filename: generated.pdfFileName,
              content: generated.pdfBuffer,
              contentType: "application/pdf",
            });
            attachedResumeTitle = generated.title;
          }
        }
      }
    }

    const mailResult = await sendEmail({
      to: recruiterEmail,
      subject,
      body,
      senderName,
      linkedin,
      resumeLink,
      github,
      leetcode,
      attachments,
      attachedResumeName: attachedResumeTitle,
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
      attachedResumeTitle,
      attachedResumeId,
      status: "Success",
    });

    return res.status(200).json({
      message: "Email sent successfully via Nodemailer!" + (attachments.length > 0 ? " (Tailored PDF Resume attached)" : ""),
      messageId: mailResult ? mailResult.messageId : null,
      attachedResume: attachedResumeTitle || null,
      emailLog: emailLog || {
        recruiterName,
        recruiterEmail,
        jobRequirement,
        subject,
        attachedResumeTitle,
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
      attachedResumeTitle,
      attachedResumeId,
      status: "Failed",
      error: error.message,
    });

    return res.status(500).json({
      message: "Failed to send email: " + error.message,
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

