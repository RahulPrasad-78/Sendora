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

const buildRegardsFooter = ({
  senderName,
  linkedin,
  resumeLink,
  github,
  leetcode,
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

  const textFooter = [
    "",
    "Best regards,",
    name,
    "",
    "---",
    `• LinkedIn: ${linkedinUrl}`,
    `• Resume: ${resumeUrl}`,
    `• GitHub: ${githubUrl}`,
    `• LeetCode: ${leetcodeUrl}`,
  ].join("\n");

  const htmlFooter = `
<br/><br/>
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #2d3748; line-height: 1.6; border-top: 2px solid #e2e8f0; padding-top: 20px; margin-top: 30px;">
  <p style="margin: 0 0 4px 0; font-weight: 500; color: #4a5568;">Best regards,</p>
  <p style="margin: 0 0 16px 0; font-size: 18px; color: #1a202c; font-weight: 700;">${name}</p>
  
  <div style="background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px 20px; width: fit-content; min-width: 320px;">
    <p style="margin: 0 0 10px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #718096;">Profiles & Resume</p>
    <table border="0" cellpadding="0" cellspacing="0" style="font-size: 14px;">
      <tr>
        <td style="padding: 4px 12px 4px 0; font-weight: 600; color: #2b6cb0;">💼 LinkedIn:</td>
        <td><a href="${linkedinUrl}" target="_blank" style="color: #3182ce; text-decoration: none;">View LinkedIn</a></td>
      </tr>
      <tr>
        <td style="padding: 4px 12px 4px 0; font-weight: 600; color: #2b6cb0;">📄 Resume:</td>
        <td><a href="${resumeUrl}" target="_blank" style="color: #3182ce; text-decoration: none;">Open Resume</a></td>
      </tr>
      <tr>
        <td style="padding: 4px 12px 4px 0; font-weight: 600; color: #2b6cb0;">💻 GitHub:</td>
        <td><a href="${githubUrl}" target="_blank" style="color: #3182ce; text-decoration: none;">Visit GitHub</a></td>
      </tr>
      <tr>
        <td style="padding: 4px 12px 4px 0; font-weight: 600; color: #2b6cb0;">🧩 LeetCode:</td>
        <td><a href="${leetcodeUrl}" target="_blank" style="color: #3182ce; text-decoration: none;">View LeetCode</a></td>
      </tr>
    </table>
  </div>
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
  });

  const fullText = body + textFooter;

  const htmlContent =
    body
      .split("\n\n")
      .map(
        (paragraph) =>
          `<p style="margin: 0 0 12px 0;">${paragraph.replace(/\n/g, "<br/>")}</p>`,
      )
      .join("") + htmlFooter;

  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text: fullText,
    html: htmlContent,
  };

  const transporter = createTransporter();
  return transporter.sendMail(mailOptions);
};

module.exports = {
  sendEmail,
};
