const rateLimit = require("express-rate-limit");

const build = (windowMs, limit, message) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { message },
  });

// Public routes that spend Gemini quota or CPU (xelatex builds)
const aiLimiter = build(
  15 * 60 * 1000,
  20,
  "Too many generation requests. Please try again in a few minutes.",
);

// Passcode guessing protection
const authLimiter = build(
  15 * 60 * 1000,
  10,
  "Too many passcode attempts. Please try again later.",
);

module.exports = { aiLimiter, authLimiter };
