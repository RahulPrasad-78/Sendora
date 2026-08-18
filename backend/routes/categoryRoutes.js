const express = require("express");
const {
  categorizeEmail,
  getCategorizedEmails,
  updateEmailStatus,
  deleteCategorizedEmail,
  sendSmartReply,
  regenerateCustomReply,
} = require("../controllers/categoryController");

const router = express.Router();

router.post("/", categorizeEmail);
router.get("/", getCategorizedEmails);
router.patch("/:id/status", updateEmailStatus);
router.delete("/:id", deleteCategorizedEmail);
router.post("/reply", sendSmartReply);
router.post("/regenerate-reply", regenerateCustomReply);

module.exports = router;
