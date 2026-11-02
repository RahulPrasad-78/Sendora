// Middleware to protect owner-only / admin-only actions in Sendora
const crypto = require("crypto");

const TOKEN_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

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

const safeEqual = (a, b) => {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
};

const sign = (payload, secret) =>
  crypto.createHmac("sha256", secret).update(payload).digest("base64url");

/** Checks a submitted passcode against the configured one in constant time. */
const verifyPasscode = (submitted) => {
  const ownerKey = getOwnerPasscode();
  return Boolean(ownerKey && submitted && safeEqual(String(submitted).trim(), ownerKey));
};

/**
 * Issues a signed, expiring token (HMAC keyed by the passcode). The passcode
 * itself never leaves the server, and changing it invalidates all tokens.
 */
const issueOwnerToken = () => {
  const ownerKey = getOwnerPasscode();
  if (!ownerKey) return null;
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + TOKEN_TTL_MS })).toString("base64url");
  return `${payload}.${sign(payload, ownerKey)}`;
};

const isOwnerAuthorized = (req) => {
  const ownerKey = getOwnerPasscode();
  if (!ownerKey) return false;

  const authHeader = req.headers["x-owner-key"] || req.headers["authorization"];
  if (!authHeader) return false;

  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : authHeader.trim();
  const [payload, signature] = token.split(".");
  if (!payload || !signature || !safeEqual(signature, sign(payload, ownerKey))) return false;

  try {
    const { exp } = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"));
    return typeof exp === "number" && exp > Date.now();
  } catch {
    return false;
  }
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
  verifyPasscode,
  issueOwnerToken,
  isOwnerAuthorized,
  requireOwner,
};
