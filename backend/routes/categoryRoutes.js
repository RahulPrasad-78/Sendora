const express = require("express");
const {
  categorizeEmail,
  getCategorizedEmails,
  updateEmailStatus,
  deleteCategorizedEmail,
  sendSmartReply,
  regenerateCustomReply,
} = require("../controllers/categoryController");
const { requireOwner } = require("../middleware/authMiddleware");
const { aiLimiter } = require("../middleware/rateLimiters");

const router = express.Router();

// The triage inbox holds private email content and can send mail from the
// owner's SMTP account, so every route here is owner-only.
router.use(requireOwner);

router.post("/", aiLimiter, categorizeEmail);
router.get("/", getCategorizedEmails);
router.patch("/:id/status", updateEmailStatus);
router.delete("/:id", deleteCategorizedEmail);
router.post("/reply", sendSmartReply);
router.post("/regenerate-reply", aiLimiter, regenerateCustomReply);

module.exports = router;
