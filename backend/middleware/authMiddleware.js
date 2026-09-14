// Middleware to protect owner-only / admin-only actions in Sendora
const isOwnerAuthorized = (req) => {
  const ownerKey = process.env.OWNER_PASSCODE || process.env.OWNER_SECRET_KEY || "SendoraOwner2026";
  const authHeader = req.headers["x-owner-key"] || req.headers["authorization"];

  if (!authHeader) return false;

  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : authHeader.trim();
  return Boolean(token && token === ownerKey);
};

const requireOwner = (req, res, next) => {
  if (isOwnerAuthorized(req)) {
    return next();
  }

  return res.status(403).json({
    error: "Owner access required",
    isRestricted: true,
    message: "This action is reserved for the verified portfolio owner. Guest/recruiter viewers can preview all features, but cannot mutate data or dispatch emails.",
  });
};

module.exports = {
  isOwnerAuthorized,
  requireOwner,
};
