const { GoogleGenerativeAI } = require("@google/generative-ai");

// --- UTILS FOR OUTREACH GENERATION ---
const extractTargetRole = (jobRequirement) => {
  if (!jobRequirement) return "Software Engineering Role";
  const lines = jobRequirement.split("\n").map((l) => l.trim()).filter(Boolean);
  for (const line of lines) {
    if (/title|role|position|developer|engineer|manager|lead/i.test(line)) {
      return line.replace(/^(job\s+title|role|position):?\s*/i, "").substring(0, 60);
    }
  }
  return lines[0] ? lines[0].substring(0, 50) : "Software Engineer Role";
};

const buildFallbackEmail = ({ jobRequirement, recruiterName }) => {
  const userName = process.env.USER_NAME || "Rahul Prasad";
  const userRole = process.env.USER_ROLE || "Full Stack Developer";
  const userSkills = process.env.USER_SKILLS || "Node.js, Express, React, MongoDB";
  const targetRole = extractTargetRole(jobRequirement);

  const subject = `Application for ${targetRole} - ${userName}`;
  const summary = (jobRequirement || "").trim().substring(0, 200);

  const body = [
    `Hi ${recruiterName || "Hiring Manager"},`,
    "",
    `I am writing to express my enthusiastic interest in the ${targetRole} position.`,
    "",
    `Having reviewed your job requirements:`,
    `"${summary}${jobRequirement && jobRequirement.length > 200 ? "..." : ""}"`,
    "",
    `With my strong expertise as a ${userRole} specializing in ${userSkills}, I am confident in my capability to contribute effectively to your engineering goals and deliver impactful results.`,
    "",
    `I would welcome the opportunity to discuss how my skill set aligns with your team's needs.`,
  ].join("\n");

  return { subject, body };
};

const parseGeneratedEmail = (responseText, context) => {
  const trimmedText = (responseText || "").trim();
  if (!trimmedText) return buildFallbackEmail(context);

  const fencedMatch = trimmedText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const rawJson = fencedMatch ? fencedMatch[1].trim() : trimmedText;

  const firstBrace = rawJson.indexOf("{");
  const lastBrace = rawJson.lastIndexOf("}");
  const jsonText =
    firstBrace !== -1 && lastBrace !== -1
      ? rawJson.substring(firstBrace, lastBrace + 1)
      : rawJson;

  try {
    const parsed = JSON.parse(jsonText);
    if (!parsed.subject || !parsed.body) {
      return buildFallbackEmail(context);
    }
    return parsed;
  } catch (error) {
    return buildFallbackEmail(context);
  }
};

const generateEmail = async ({ jobRequirement, recruiterName }) => {
  const userName = process.env.USER_NAME || "Rahul Prasad";
  const userRole = process.env.USER_ROLE || "Full Stack Developer";
  const userSkills = process.env.USER_SKILLS || "Node.js, Express, React, MongoDB, JavaScript";
  const userResumeSummary = process.env.USER_RESUME_SUMMARY || "Experienced full stack software engineer.";

  if (!process.env.GEMINI_API_KEY) {
    return buildFallbackEmail({ jobRequirement, recruiterName });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800,
      },
    });

    const prompt = [
      "You are an AI assistant writing a personalized, compelling job outreach email.",
      `Sender Name: ${userName}`,
      `Sender Current Role: ${userRole}`,
      `Sender Skills: ${userSkills}`,
      `Sender Profile Summary: ${userResumeSummary}`,
      `Recipient Name: ${recruiterName || "Hiring Manager"}`,
      `Job Requirements / Job Description:`,
      `"""${jobRequirement || "Full Stack Developer Position"}"""`,
      "Write a professional, targeted, and concise cold outreach email tailored specifically to match the job requirement provided.",
      "Do NOT include signature links (LinkedIn, GitHub, LeetCode, Resume) in the email body, as those will be appended automatically in the regards section.",
      'Return ONLY valid JSON with exactly two keys: "subject" and "body". Example: {"subject": "...", "body": "..."}',
    ].join("\n");

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    return parseGeneratedEmail(responseText, { jobRequirement, recruiterName });
  } catch (error) {
    console.warn("Gemini API call warning, utilizing intelligent fallback response:", error.message);
    const fallback = buildFallbackEmail({ jobRequirement, recruiterName });
    const isQuota = /429|quota|RESOURCE_EXHAUSTED/i.test(error.message);
    const isBusy = /503/i.test(error.message);
    if (isQuota) {
      fallback.isQuotaExceeded = true;
      fallback.aiErrorMessage = "Google Gemini API daily quota or rate limit exceeded (429). Used default outreach template fallback.";
    } else if (isBusy) {
      fallback.aiErrorMessage = "Google Gemini API is temporarily busy (503). Used default outreach template fallback.";
    } else {
      fallback.aiErrorMessage = `Gemini API notice: ${error.message}`;
    }
    return fallback;
  }
};

// --- CATEGORIZATION ENGINE & SMART REPLIES ---

const fallbackCategorize = ({ emailText, subject = "", senderName = "" }) => {
  const text = `${subject} ${emailText}`.toLowerCase();
  const userName = process.env.USER_NAME || "Rahul Prasad";

  // 1. Interview Invitation
  if (/interview|screening round|zoom link|google meet|schedule a call|phone chat|technical round|hiring manager chat/i.test(text)) {
    return {
      category: "Interview Invitation",
      priority: "P1",
      confidenceScore: 95,
      summary: "Invitation to schedule or attend an interview round with the hiring team.",
      actionRequired: "Review proposed time slots or scheduling link and confirm your availability.",
      deadline: "Within 24-48 hours",
      sentiment: "Positive",
      suggestedReply: `Hi ${senderName || "there"},\n\nThank you for reaching out! I would be delighted to speak with the team. I am available during the proposed times and look forward to our conversation.\n\nBest regards,\n${userName}`,
    };
  }

  // 2. Job Offer or Assessment
  if (/offer letter|job offer|compensation package|hackerrank|codility|take-home|assessment|online test|technical test/i.test(text)) {
    const isOffer = /offer letter|formal offer|compensation/i.test(text);
    return {
      category: "Job Offer / Assessment",
      priority: "P1",
      confidenceScore: 92,
      summary: isOffer
        ? "Formal job offer or compensation details received."
        : "Online technical assessment or take-home assignment received.",
      actionRequired: isOffer
        ? "Review the offer terms, compensation breakdown, and start date."
        : "Complete the technical assessment before the specified deadline.",
      deadline: isOffer ? "Review within 3 days" : "48-72 hours",
      sentiment: "Positive",
      suggestedReply: `Hi ${senderName || "there"},\n\nThank you for sending this over! I will review the details thoroughly and complete the required steps promptly.\n\nBest regards,\n${userName}`,
    };
  }

  // 3. Application Rejection
  if (/unfortunately|not moving forward|other candidates|impressive background.*cannot offer|pursue other/i.test(text)) {
    return {
      category: "Application Rejection",
      priority: "P4",
      confidenceScore: 96,
      summary: "Notification indicating the application will not be moving forward at this time.",
      actionRequired: "None required. Optional: Send a courteous thank-you note to keep the door open for future openings.",
      deadline: "None",
      sentiment: "Rejection",
      suggestedReply: `Hi ${senderName || "there"},\n\nThank you for letting me know. I truly appreciate the team's time and consideration, and I hope we can stay in touch for future opportunities.\n\nBest regards,\n${userName}`,
    };
  }

  // 4. Recruiter Outreach / Lead
  if (/came across your profile|linkedin profile|exciting opportunity|open position|are you open to new opportunities|looking for a|recruiter/i.test(text)) {
    return {
      category: "Recruiter Outreach / Lead",
      priority: "P2",
      confidenceScore: 88,
      summary: "A recruiter or talent partner reaching out with a potential job opportunity.",
      actionRequired: "Share your resume and clarify your availability or interest in the position.",
      deadline: "Within 2-3 business days",
      sentiment: "Positive",
      suggestedReply: `Hi ${senderName || "there"},\n\nThank you for reaching out! The role sounds interesting. I have attached my latest resume and would love to learn more about the team's roadmap and requirements.\n\nBest regards,\n${userName}`,
    };
  }

  // 5. Follow-up / Action Needed
  if (/action required|please provide|documents|share your|pending|urgent|reminder|update on/i.test(text)) {
    return {
      category: "Action / Follow-Up Needed",
      priority: "P3",
      confidenceScore: 84,
      summary: "The sender is requesting additional information, documents, or an update.",
      actionRequired: "Respond with the requested details or documentation.",
      deadline: "As soon as possible",
      sentiment: "Urgent",
      suggestedReply: `Hi ${senderName || "there"},\n\nThank you for the update. Here are the details you requested. Please let me know if you need anything else.\n\nBest regards,\n${userName}`,
    };
  }

  // 6. Spam / Marketing
  if (/unsubscribe|click here|sale|discount|promo|crypto|special offer|opt out/i.test(text)) {
    return {
      category: "Spam / Irrelevant",
      priority: "P0",
      confidenceScore: 90,
      summary: "Promotional, marketing, or unsolicited broadcast email.",
      actionRequired: "None (safe to ignore or delete).",
      deadline: "None",
      sentiment: "Neutral",
      suggestedReply: "No response necessary.",
    };
  }

  // 7. General / Newsletter default
  return {
    category: "Newsletter & General",
    priority: "P5",
    confidenceScore: 78,
    summary: "General informational update or newsletter message.",
    actionRequired: "None required.",
    deadline: "None",
    sentiment: "Neutral",
    suggestedReply: `Hi ${senderName || "there"},\n\nThank you for sharing this update!\n\nBest regards,\n${userName}`,
  };
};

const parseCategorizationResponse = (responseText, context) => {
  const trimmed = (responseText || "").trim();
  if (!trimmed) return fallbackCategorize(context);

  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const rawJson = fencedMatch ? fencedMatch[1].trim() : trimmed;

  const firstBrace = rawJson.indexOf("{");
  const lastBrace = rawJson.lastIndexOf("}");
  const jsonText =
    firstBrace !== -1 && lastBrace !== -1
      ? rawJson.substring(firstBrace, lastBrace + 1)
      : rawJson;

  try {
    const parsed = JSON.parse(jsonText);
    const validCategories = [
      "Interview Invitation",
      "Job Offer / Assessment",
      "Recruiter Outreach / Lead",
      "Action / Follow-Up Needed",
      "Application Rejection",
      "Newsletter & General",
      "Spam / Irrelevant",
    ];

    if (!parsed.category || !validCategories.includes(parsed.category)) {
      return fallbackCategorize(context);
    }

    return {
      category: parsed.category,
      priority: parsed.priority || "P3",
      confidenceScore: typeof parsed.confidenceScore === "number" ? parsed.confidenceScore : 92,
      summary: parsed.summary || "Summary extracted by AI.",
      actionRequired: parsed.actionRequired || "None",
      deadline: parsed.deadline || "None",
      sentiment: parsed.sentiment || "Neutral",
      suggestedReply: parsed.suggestedReply || "",
    };
  } catch (error) {
    return fallbackCategorize(context);
  }
};

const categorizeEmailContent = async ({ emailText, subject = "", senderName = "", senderEmail = "" }) => {
  const userName = process.env.USER_NAME || "Rahul Prasad";
  const userRole = process.env.USER_ROLE || "Full Stack Developer";

  if (!emailText || !emailText.trim()) {
    throw new Error("Email content is required for categorization");
  }

  if (!process.env.GEMINI_API_KEY) {
    return fallbackCategorize({ emailText, subject, senderName });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2,
        maxOutputTokens: 800,
      },
    });

    const prompt = `
You are an expert AI Email Analyst and Triage Officer.
Analyze the following email received by ${userName} (${userRole}).

Sender Name: ${senderName || "Unknown"}
Sender Email: ${senderEmail || "Unknown"}
Subject: ${subject || "No Subject"}
Raw Email Content:
"""
${emailText}
"""

Instructions:
1. Classify the email into EXACTLY one of these 7 categories:
   - "Interview Invitation" (if it contains interview invitations, screening calls, meeting links, Google Meet/Zoom scheduling)
   - "Job Offer / Assessment" (if it contains job offers, compensation terms, OA tests, HackerRank/Codility assessments)
   - "Recruiter Outreach / Lead" (if a recruiter reaches out regarding a new role, talent search, or requests a resume)
   - "Action / Follow-Up Needed" (if the sender requires documents, feedback, or a pending response)
   - "Application Rejection" (if it notifies that the candidate will not be moving forward)
   - "Newsletter & General" (if it is a general company update, job digest, or newsletter)
   - "Spam / Irrelevant" (if it is unsolicited marketing, promotional spam, or irrelevant)

2. Determine Priority:
   - "P1" for Interview Invitations and Job Offers/Assessments
   - "P2" for Recruiter Leads
   - "P3" for Action/Follow-Up Items
   - "P4" for Rejections
   - "P5" for Newsletters
   - "P0" for Spam

3. Extract:
   - confidenceScore: integer (0-100)
   - summary: clear 1-2 sentence core takeaway
   - actionRequired: specific action the recipient should take, or "None"
   - deadline: explicit date/timeframe mentioned, or "None"
   - sentiment: "Positive" | "Neutral" | "Urgent" | "Rejection" | "Negative"
   - suggestedReply: a polite, tailored, ready-to-send email response from ${userName}

Return ONLY valid JSON matching this schema:
{
  "category": "Interview Invitation" | "Job Offer / Assessment" | "Recruiter Outreach / Lead" | "Action / Follow-Up Needed" | "Application Rejection" | "Newsletter & General" | "Spam / Irrelevant",
  "priority": "P1" | "P2" | "P3" | "P4" | "P5" | "P0",
  "confidenceScore": number,
  "summary": string,
  "actionRequired": string,
  "deadline": string,
  "sentiment": "Positive" | "Neutral" | "Urgent" | "Rejection" | "Negative",
  "suggestedReply": string
}
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    return parseCategorizationResponse(responseText, { emailText, subject, senderName });
  } catch (error) {
    console.warn("Gemini categorization warning, utilizing smart fallback classifier:", error.message);
    return fallbackCategorize({ emailText, subject, senderName });
  }
};

const generateCustomReply = async ({ emailText, subject, senderName, replyIntent, customInstructions }) => {
  const userName = process.env.USER_NAME || "Rahul Prasad";

  if (!process.env.GEMINI_API_KEY) {
    return `Hi ${senderName || "there"},\n\nThank you for reaching out. ${customInstructions || "I have received your message and will follow up shortly."}\n\nBest regards,\n${userName}`;
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 500,
      },
    });

    const prompt = `
You are an AI Email Assistant drafting an email response on behalf of ${userName}.
Context Email:
Subject: ${subject || ""}
Sender: ${senderName || "Hiring Team"}
Content:
"""${emailText || ""}"""

Reply Intent: ${replyIntent || "Professional and positive response"}
Custom Instructions: ${customInstructions || "Draft a warm, concise, professional reply."}

Write ONLY the email body response. Do NOT include placeholder tags like [Your Name] — use ${userName}.
`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    return `Hi ${senderName || "there"},\n\nThank you for your email. I will review and get back to you soon.\n\nBest regards,\n${userName}`;
  }
};

module.exports = {
  generateEmail,
  categorizeEmailContent,
  generateCustomReply,
};
