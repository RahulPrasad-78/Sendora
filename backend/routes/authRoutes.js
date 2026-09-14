const express = require("express");
const router = express.Router();
const { isOwnerAuthorized } = require("../middleware/authMiddleware");

// POST /api/auth/verify-owner
// Checks submitted passcode against server environment
router.post("/verify-owner", (req, res) => {
  const { passcode } = req.body;
  const configuredPasscode = process.env.OWNER_PASSCODE || process.env.OWNER_SECRET_KEY || "SendoraOwner2026";

  if (!passcode) {
    return res.status(400).json({ success: false, message: "Passcode is required." });
  }

  if (passcode.trim() === configuredPasscode) {
    return res.status(200).json({
      success: true,
      token: configuredPasscode,
      message: "Owner access verified! All dispatch and edit actions unlocked.",
    });
  }

  return res.status(401).json({
    success: false,
    message: "Incorrect owner passcode. Please check your credentials.",
  });
});

// GET /api/auth/status
// Validates whether incoming request header is owner authorized
router.get("/status", (req, res) => {
  const authorized = isOwnerAuthorized(req);
  return res.status(200).json({ isOwner: authorized });
});

module.exports = router;
