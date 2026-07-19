const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Define schema for structured JSON output
const emailSchema = {
  type: "OBJECT",
  properties: {
    subject: {
      type: "STRING",
      description: "A short, professional subject line.",
    },
    body: {
      type: "STRING",
      description: "The body of the outreach email.",
    },
  },
  required: ["subject", "body"],
};

const generateEmail = async (recruiterName) => {
  const userName = process.env.USER_NAME || "the candidate";
  const userRole = process.env.USER_ROLE || "Software Engineer";
  const userSkills = process.env.USER_SKILLS || "";
  const userResumeSummary = process.env.USER_RESUME_SUMMARY || "";

  const model = genAI.getGenerativeModel({
    model: "gemini-3.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: emailSchema,
      temperature: 0.7,
    },
  });

  const prompt = [
    "You are an AI assistant writing a personalized job outreach email.",
    `The sender is ${userName}, seeking a ${userRole} position.`,
    `Skills: ${userSkills}.`,
    `Profile summary: ${userResumeSummary}.`,
    `Write a professional, friendly, and short cold email to a recruiter named ${recruiterName}.`,
    "Keep the email under 150 words.",
  ].join(" ");

  const result = await model.generateContent(prompt);
  const responseText = result.response.text().trim();

  return JSON.parse(responseText);
};

module.exports = {
  generateEmail,
};
