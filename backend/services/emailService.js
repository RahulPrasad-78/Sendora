const nodemailer = require("nodemailer");

const getSmtpConfig = () => {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 465);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpUser || !smtpPass) {
    throw new Error(
      "SMTP configuration is incomplete. Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS in backend/.env.",
    );
  }

  return {
    smtpHost,
    smtpPort,
    smtpUser,
    smtpPass,
  };
};

// One pooled transporter per SMTP config, reused across sends (a new pool per send leaks connections).
let cachedTransporter = null;
let cachedTransporterKey = "";

const createTransporter = () => {
  const { smtpHost, smtpPort, smtpUser, smtpPass } = getSmtpConfig();
  const key = [smtpHost, smtpPort, smtpUser, smtpPass].join("|");
  if (cachedTransporter && cachedTransporterKey === key) return cachedTransporter;
  if (cachedTransporter) cachedTransporter.close();

  cachedTransporterKey = key;
  cachedTransporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    pool: true,              // Reuse connections for speed
    connectionTimeout: 10000, // 10s to establish connection (fail fast)
    greetingTimeout: 10000,   // 10s for SMTP greeting
    socketTimeout: 15000,     // 15s max for any socket operation
  });
  return cachedTransporter;
};

// Strips a trailing sign-off ("Best regards," + name lines), but only when the sign-off is a
// line of its own near the end, so body text like "Regards the stack..." is never truncated.
const stripTrailingSignOff = (text) => {
  const lines = text.split("\n");
  const signOff = /^\s*(?:(?:best|warm|kind)\s+)?regards,?\s*$|^\s*sincerely,?\s*$/i;
  for (let i = lines.length - 1; i >= 0 && i >= lines.length - 5; i--) {
    if (signOff.test(lines[i])) {
      return lines.slice(0, i).join("\n");
    }
  }
  return text;
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

// Only http(s) links are allowed in the signature (blocks javascript: and similar)
const safeUrl = (url) => {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.href : "";
  } catch {
    return "";
  }
};

const formatDisplayLink = (url, fallbackLabel) => {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    if (
      parsed.hostname.includes("drive.google.com") ||
      parsed.hostname.includes("docs.google.com")
    ) {
      return fallbackLabel || "View Online Resume";
    }
    const display = (parsed.hostname + parsed.pathname)
      .replace(/^www\./, "")
      .replace(/\/$/, "");
    return display || fallbackLabel || url;
  } catch {
    return fallbackLabel || url;
  }
};

const buildRegardsFooter = ({
  senderName,
  linkedin,
  resumeLink,
  github,
  leetcode,
  attachedResumeName,
}) => {
  const name = senderName || process.env.USER_NAME || "Rahul Prasad";
  const linkedinUrl = safeUrl(linkedin || process.env.USER_LINKEDIN);
  const resumeUrl = safeUrl(resumeLink || process.env.USER_RESUME);
  const githubUrl = safeUrl(github || process.env.USER_GITHUB);
  const leetcodeUrl = safeUrl(leetcode || process.env.USER_LEETCODE);

  const textFooterLines = [
    "",
    "Best regards,",
    name,
    "",
  ];

  if (linkedinUrl) textFooterLines.push(`LinkedIn: ${linkedinUrl}`);
  if (githubUrl) textFooterLines.push(`GitHub: ${githubUrl}`);
  if (leetcodeUrl) textFooterLines.push(`LeetCode: ${leetcodeUrl}`);
  if (resumeUrl) textFooterLines.push(`Resume: ${resumeUrl}`);

  if (attachedResumeName) {
    textFooterLines.push(`Attachment: ${attachedResumeName} (PDF)`);
  }

  const textFooter = textFooterLines.join("\n");

  const linkedinDisplay = formatDisplayLink(linkedinUrl, "LinkedIn Profile");
  const githubDisplay = formatDisplayLink(githubUrl, "GitHub Profile");
  const leetcodeDisplay = formatDisplayLink(leetcodeUrl, "LeetCode Profile");
  const resumeDisplay = formatDisplayLink(resumeUrl, "View Online Resume");

  const linkRows = [];
  if (linkedinUrl) {
    linkRows.push(
      `<div>LinkedIn: <a href="${escapeHtml(linkedinUrl)}" target="_blank" style="color: #0969da; text-decoration: underline;">${escapeHtml(linkedinDisplay)}</a></div>`
    );
  }
  if (githubUrl) {
    linkRows.push(
      `<div>GitHub: <a href="${escapeHtml(githubUrl)}" target="_blank" style="color: #0969da; text-decoration: underline;">${escapeHtml(githubDisplay)}</a></div>`
    );
  }
  if (leetcodeUrl) {
    linkRows.push(
      `<div>LeetCode: <a href="${escapeHtml(leetcodeUrl)}" target="_blank" style="color: #0969da; text-decoration: underline;">${escapeHtml(leetcodeDisplay)}</a></div>`
    );
  }
  if (resumeUrl) {
    linkRows.push(
      `<div>Resume: <a href="${escapeHtml(resumeUrl)}" target="_blank" style="color: #0969da; text-decoration: underline;">${escapeHtml(resumeDisplay)}</a></div>`
    );
  }

  const attachedNoteHtml = attachedResumeName
    ? `<div style="margin-top: 10px; font-size: 13px; color: #57606a;">Attachment: ${escapeHtml(attachedResumeName)} (PDF)</div>`
    : "";

  const htmlFooter = `
<div style="margin-top: 28px; padding-top: 16px; border-top: 1px solid #e1e4e8; font-size: 14px; line-height: 1.6; color: #24292f;">
  <p style="margin: 0 0 4px 0; font-size: 14px; color: #24292f;">Best regards,</p>
  <p style="margin: 0 0 12px 0; font-size: 15px; font-weight: 600; color: #24292f;">${escapeHtml(name)}</p>
  ${
    linkRows.length > 0
      ? `<div style="font-size: 13px; line-height: 1.6; color: #57606a;">
    ${linkRows.join("\n    ")}
  </div>`
      : ""
  }
  ${attachedNoteHtml}
</div>`;

  return { textFooter, htmlFooter };
};

const sendEmail = async ({
  to,
  subject,
  body,
  senderName,
  linkedin,
  resumeLink,
  github,
  leetcode,
  attachments = [],
  attachedResumeName = "",
}) => {
  if (!to) {
    throw new Error("Recipient email address is required");
  }

  if (!subject) {
    throw new Error("Email subject is required");
  }

  if (!body) {
    throw new Error("Email body content is required");
  }

  const { textFooter, htmlFooter } = buildRegardsFooter({
    senderName,
    linkedin,
    resumeLink,
    github,
    leetcode,
    attachedResumeName,
  });

  const rawBody = (body || "").trim();
  // Prevent duplicate sign-offs if the body already has a regards/sign-off ending
  const sanitizedBody = stripTrailingSignOff(rawBody).trim();

  const fullText = sanitizedBody + "\n" + textFooter;

  const paragraphsHtml = sanitizedBody
    .split(/\n{2,}/)
    .filter((paragraph) => paragraph.trim())
    .map(
      (paragraph) =>
        `<p style="margin: 0 0 14px 0; font-size: 14px; line-height: 1.6; color: #24292f;">${escapeHtml(paragraph).replace(/\n/g, "<br/>")}</p>`,
    )
    .join("\n");

  const htmlContent = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #24292f; max-width: 650px;">
${paragraphsHtml}
${htmlFooter}
</div>`;

  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text: fullText,
    html: htmlContent,
    attachments: attachments || [],
  };

  const transporter = createTransporter();
  return transporter.sendMail(mailOptions);
};

module.exports = {
  sendEmail,
};
