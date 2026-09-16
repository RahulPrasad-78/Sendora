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

const createTransporter = () => {
  const { smtpHost, smtpPort, smtpUser, smtpPass } = getSmtpConfig();

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
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
  const linkedinUrl =
    linkedin ||
    process.env.USER_LINKEDIN ||
    "https://www.linkedin.com/in/rahul-prasad-/";
  const resumeUrl =
    resumeLink ||
    process.env.USER_RESUME ||
    "https://drive.google.com/file/d/1krnyEIoKRe2B3kQsSvw_ztOPTpd9ya-f/view?usp=drive_link";
  const githubUrl =
    github || process.env.USER_GITHUB || "https://github.com/RahulPrasad-78";
  const leetcodeUrl =
    leetcode ||
    process.env.USER_LEETCODE ||
    "https://leetcode.com/u/Rahul__78/";

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
      `<div>LinkedIn: <a href="${linkedinUrl}" target="_blank" style="color: #0969da; text-decoration: underline;">${linkedinDisplay}</a></div>`
    );
  }
  if (githubUrl) {
    linkRows.push(
      `<div>GitHub: <a href="${githubUrl}" target="_blank" style="color: #0969da; text-decoration: underline;">${githubDisplay}</a></div>`
    );
  }
  if (leetcodeUrl) {
    linkRows.push(
      `<div>LeetCode: <a href="${leetcodeUrl}" target="_blank" style="color: #0969da; text-decoration: underline;">${leetcodeDisplay}</a></div>`
    );
  }
  if (resumeUrl) {
    linkRows.push(
      `<div>Resume: <a href="${resumeUrl}" target="_blank" style="color: #0969da; text-decoration: underline;">${resumeDisplay}</a></div>`
    );
  }

  const attachedNoteHtml = attachedResumeName
    ? `<div style="margin-top: 10px; font-size: 13px; color: #57606a;">Attachment: ${attachedResumeName} (PDF)</div>`
    : "";

  const htmlFooter = `
<div style="margin-top: 28px; padding-top: 16px; border-top: 1px solid #e1e4e8; font-size: 14px; line-height: 1.6; color: #24292f;">
  <p style="margin: 0 0 4px 0; font-size: 14px; color: #24292f;">Best regards,</p>
  <p style="margin: 0 0 12px 0; font-size: 15px; font-weight: 600; color: #24292f;">${name}</p>
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
  const sanitizedBody = rawBody
    .replace(
      /\n+(best\s+regards|warm\s+regards|regards|kind\s+regards|sincerely)[\s\S]*$/i,
      ""
    )
    .trim();

  const fullText = sanitizedBody + "\n" + textFooter;

  const paragraphsHtml = sanitizedBody
    .split(/\n{2,}/)
    .filter((paragraph) => paragraph.trim())
    .map(
      (paragraph) =>
        `<p style="margin: 0 0 14px 0; font-size: 14px; line-height: 1.6; color: #24292f;">${paragraph.replace(/\n/g, "<br/>")}</p>`,
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
