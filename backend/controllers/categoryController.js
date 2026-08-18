const CategorizedEmail = require("../models/CategorizedEmail");
const { categorizeEmailContent, generateCustomReply } = require("../services/aiService");
const { sendEmail } = require("../services/emailService");

// In-memory cache fallback if MongoDB is not connected
let memoryCategorizedStore = [];

const categorizeEmail = async (req, res) => {
  try {
    const { rawContent, subject, senderName, senderEmail } = req.body;

    if (!rawContent || !rawContent.trim()) {
      return res.status(400).json({ message: "Email rawContent is required" });
    }

    // Run AI categorization
    const aiAnalysis = await categorizeEmailContent({
      emailText: rawContent,
      subject: subject || "No Subject",
      senderName: senderName || "Hiring Team",
      senderEmail: senderEmail || "",
    });

    const emailPayload = {
      senderName: senderName || "Unknown Sender",
      senderEmail: senderEmail || "",
      subject: subject || "No Subject",
      rawContent,
      category: aiAnalysis.category,
      priority: aiAnalysis.priority,
      confidenceScore: aiAnalysis.confidenceScore,
      summary: aiAnalysis.summary,
      actionRequired: aiAnalysis.actionRequired,
      deadline: aiAnalysis.deadline,
      sentiment: aiAnalysis.sentiment,
      suggestedReply: aiAnalysis.suggestedReply,
      status: "Unread",
    };

    let savedRecord = null;
    try {
      savedRecord = await CategorizedEmail.create(emailPayload);
    } catch (dbError) {
      console.warn("MongoDB write warning, using in-memory store:", dbError.message);
      savedRecord = {
        _id: "mem_" + Date.now(),
        ...emailPayload,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryCategorizedStore.unshift(savedRecord);
    }

    return res.status(201).json({
      message: "Email successfully categorized!",
      data: savedRecord,
    });
  } catch (error) {
    console.error("Categorization error:", error);
    return res.status(500).json({
      message: "Failed to categorize email",
      error: error.message,
    });
  }
};

const getCategorizedEmails = async (req, res) => {
  try {
    const { category, priority, status, search } = req.query;
    const filter = {};

    if (category && category !== "All") filter.category = category;
    if (priority && priority !== "All") filter.priority = priority;
    if (status && status !== "All") filter.status = status;
    if (search) {
      filter.$or = [
        { subject: { $regex: search, $options: "i" } },
        { senderName: { $regex: search, $options: "i" } },
        { summary: { $regex: search, $options: "i" } },
        { rawContent: { $regex: search, $options: "i" } },
      ];
    }

    let emails = [];
    try {
      emails = await CategorizedEmail.find(filter).sort({ createdAt: -1 }).limit(100);
    } catch (dbError) {
      emails = memoryCategorizedStore;
      if (category && category !== "All") emails = emails.filter((e) => e.category === category);
      if (priority && priority !== "All") emails = emails.filter((e) => e.priority === priority);
      if (status && status !== "All") emails = emails.filter((e) => e.status === status);
      if (search) {
        const s = search.toLowerCase();
        emails = emails.filter(
          (e) =>
            (e.subject && e.subject.toLowerCase().includes(s)) ||
            (e.senderName && e.senderName.toLowerCase().includes(s)) ||
            (e.summary && e.summary.toLowerCase().includes(s))
        );
      }
    }

    return res.status(200).json(emails);
  } catch (error) {
    return res.status(200).json(memoryCategorizedStore);
  }
};

const updateEmailStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["Unread", "Read", "Replied", "Archived"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    try {
      const updated = await CategorizedEmail.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );
      if (updated) return res.status(200).json(updated);
    } catch (dbErr) {
      const idx = memoryCategorizedStore.findIndex((e) => e._id === id);
      if (idx !== -1) {
        memoryCategorizedStore[idx].status = status;
        return res.status(200).json(memoryCategorizedStore[idx]);
      }
    }

    return res.status(200).json({ message: "Status updated", status });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update status", error: error.message });
  }
};

const deleteCategorizedEmail = async (req, res) => {
  try {
    const { id } = req.params;
    try {
      await CategorizedEmail.findByIdAndDelete(id);
    } catch (dbErr) {
      memoryCategorizedStore = memoryCategorizedStore.filter((e) => e._id !== id);
    }
    return res.status(200).json({ message: "Email record deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete record", error: error.message });
  }
};

const sendSmartReply = async (req, res) => {
  try {
    const { emailId, recipientEmail, subject, body, senderName } = req.body;

    if (!recipientEmail || !subject || !body) {
      return res.status(400).json({
        message: "recipientEmail, subject, and body are required to send reply",
      });
    }

    const mailResult = await sendEmail({
      to: recipientEmail,
      subject: subject.startsWith("Re:") ? subject : `Re: ${subject}`,
      body,
      senderName: senderName || process.env.USER_NAME || "Rahul Prasad",
    });

    if (emailId) {
      try {
        await CategorizedEmail.findByIdAndUpdate(emailId, { status: "Replied" });
      } catch (dbErr) {
        const item = memoryCategorizedStore.find((e) => e._id === emailId);
        if (item) item.status = "Replied";
      }
    }

    return res.status(200).json({
      message: `Smart reply sent successfully to ${recipientEmail}!`,
      messageId: mailResult ? mailResult.messageId : null,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to send smart reply: " + error.message,
      error: error.message,
    });
  }
};

const regenerateCustomReply = async (req, res) => {
  try {
    const { emailText, subject, senderName, replyIntent, customInstructions } = req.body;
    const reply = await generateCustomReply({
      emailText,
      subject,
      senderName,
      replyIntent,
      customInstructions,
    });

    return res.status(200).json({ reply });
  } catch (error) {
    return res.status(500).json({ message: "Failed to generate custom reply", error: error.message });
  }
};

module.exports = {
  categorizeEmail,
  getCategorizedEmails,
  updateEmailStatus,
  deleteCategorizedEmail,
  sendSmartReply,
  regenerateCustomReply,
};
