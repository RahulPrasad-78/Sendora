// Middleware to protect owner-only / admin-only actions in Sendora

/**
 * Returns the configured owner passcode, or null when none is set.
 * There is intentionally NO hardcoded fallback: if OWNER_PASSCODE is missing,
 * Owner Mode stays locked rather than defaulting to a value that is public in
 * the repository. Set OWNER_PASSCODE in backend/.env (and in your host's
 * environment variables) to unlock dispatch and database edits.
 */
const getOwnerPasscode = () => {
  const configured = process.env.OWNER_PASSCODE || process.env.OWNER_SECRET_KEY || "";
  return configured.trim() || null;
};

const isOwnerAuthorized = (req) => {
  const ownerKey = getOwnerPasscode();
  if (!ownerKey) return false;

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
    message: getOwnerPasscode()
      ? "This action is reserved for the verified portfolio owner. Guest/recruiter viewers can preview all features, but cannot mutate data or dispatch emails."
      : "Owner Mode is disabled because OWNER_PASSCODE is not configured on the server.",
  });
};

module.exports = {
  getOwnerPasscode,
  isOwnerAuthorized,
  requireOwner,
};
