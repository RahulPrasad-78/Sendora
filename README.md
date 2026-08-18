# Sendora — AI Email Outreach & Smart Categorization Suite

> **Sendora** is an intelligent email automation platform featuring two core engines:
> 1. **AI Cold Outreach Framer & Nodemailer Dispatcher**: Analyzes job requirements to frame hyper-personalized cold outreach emails and sends them via Gmail SMTP with social/portfolio signatures.
> 2. **AI Email Categorizer & Triage Engine (Scale-Up)**: Reads incoming emails or job updates, automatically classifies them by intent and priority, extracts key action items & deadlines, and drafts instant smart replies.

---

## 📑 Table of Contents
- [System Architecture](#system-architecture)
- [Module 1: Cold Email Outreach (Complete & Active)](#module-1-cold-email-outreach-complete--active)
- [Module 2: AI Email Categorizer & Triage (Scale-Up Architecture)](#module-2-ai-email-categorizer--triage-scale-up-architecture)
  - [Categorization Taxonomy & Priority Matrix](#categorization-taxonomy--priority-matrix)
  - [Data Flow Diagram](#data-flow-diagram)
  - [Backend API & Database Schema](#backend-api--database-schema)
  - [AI Prompt Engineering & JSON Output](#ai-prompt-engineering--json-output)
  - [Step-by-Step Implementation Roadmap](#step-by-step-implementation-roadmap)
- [Project Directory Structure](#project-directory-structure)
- [Current API Reference](#current-api-reference)
- [Setup & Local Development](#setup--local-development)
- [Environment Variables](#environment-variables)
- [Author](#author)

---

## System Architecture

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   SENDORA WEB APP                                      │
├──────────────────────────────────────────┬─────────────────────────────────────────────┤
│         MODULE 1: OUTREACH ENGINE        │         MODULE 2: CATEGORIZATION ENGINE     │
│  • Paste Job Requirement / Description   │  • Paste Inbound Email / Recruiter Reply   │
│  • AI crafts personalized pitch          │  • AI reads, categorizes & extracts tasks   │
│  • Appends LinkedIn, Resume, GitHub      │  • Assigns Priority & Sentiment score       │
│  • Dispatches via Nodemailer (SMTP)      │  • Drafts 1-Click Smart Reply               │
└────────────────────┬─────────────────────┴──────────────────────┬──────────────────────┘
                     │                                            │
                     ▼                                            ▼
┌──────────────────────────────────────────┐ ┌──────────────────────────────────────────┐
│        POST /api/emails/generate         │ │        POST /api/emails/categorize        │
│        POST /api/emails/send             │ │        GET  /api/emails/categorized       │
└────────────────────┬─────────────────────┘ └────────────────────┬─────────────────────┘
                     │                                            │
                     ▼                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                  BACKEND SERVICES                                      │
│  • aiService.js       : Google Gemini 2.0 Flash with JSON structured response schema   │
│  • emailService.js    : Nodemailer SMTP with HTML signatures                           │
│  • categoryService.js : Categorization classifier + metadata extractor                │
│  • MongoDB Atlas      : Stores EmailLog and CategorizedEmail collections               │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Module 1: Cold Email Outreach (Complete & Active)

This module is fully built, tested, and operational in your project.

### How it works:
1. **Input Details**: Enter the recruiter's name, email, and paste the job description/requirements.
2. **AI Email Framing**: Gemini analyzes your profile (`USER_NAME`, `USER_ROLE`, `USER_SKILLS`, `USER_RESUME_SUMMARY` in `.env`) alongside the JD and writes a targeted subject and body.
3. **Editable Preview**: Review and edit the framed message in the right panel.
4. **Instant Nodemailer Dispatch**: Hit "Send Email via Nodemailer" to deliver the message via Gmail SMTP (port 465 SSL) complete with an auto-appended signature containing:
   - 💼 LinkedIn Profile
   - 📄 Resume Link
   - 💻 GitHub Profile
   - 🧩 LeetCode Profile
5. **Persistent History**: All sent emails are logged to MongoDB Atlas and rendered in the live history table.

---

## Module 2: AI Email Categorizer & Triage (Scale-Up Architecture)

The **AI Email Categorizer** is designed to process inbound messages (recruiter replies, application statuses, job opportunities, or pasted email threads) and classify them into clear actionable buckets.

### Categorization Taxonomy & Priority Matrix

| Category | Priority | Badge Color | Description & Trigger Examples |
|:---|:---:|:---:|:---|
| 🎯 **Interview Invitation** | **P1 (Critical)** | `Emerald Green` | Interview scheduling, screen rounds, meeting links, Google Meet/Zoom invites. |
| 💼 **Job Offer / Assessment** | **P1 (Critical)** | `Gold / Amber` | Formal offer letters, Take-Home assignments, HackerRank/Codility test links. |
| 🤝 **Recruiter Outreach / Lead** | **P2 (High)** | `Sky Blue` | Recruiter asking for resume, inquiring about availability, or proposing a role. |
| ⏳ **Action / Follow-Up Needed** | **P3 (Medium)** | `Indigo / Purple` | Pending questions, salary expectation queries, document submissions. |
| 🚫 **Application Rejection** | **P4 (Low)** | `Slate / Gray` | "Moved forward with other candidates", standard automated rejection notice. |
| 📰 **Newsletter & General** | **P5 (Low)** | `Zinc / Dark Gray`| Company announcements, job alerts, platform digests. |
| 🛑 **Spam / Irrelevant** | **P0 (None)** | `Red` | Marketing spam, unverified promotions, irrelevant bulk emails. |

---

### Data Flow Diagram

```
┌──────────────────────────────────────┐
│  Inbound Email / Recruiter Response  │
│  (Pasted by user or fetched via IMAP)│
└──────────────────┬───────────────────┘
                   │
                   ▼
┌──────────────────────────────────────┐
│ POST /api/emails/categorize          │
└──────────────────┬───────────────────┘
                   │
                   ▼
┌──────────────────────────────────────┐
│ backend/services/aiService.js        │
│  • Calls Gemini 2.0 Flash            │
│  • Evaluates context & sender intent │
│  • Enforces Strict JSON Output       │
└──────────────────┬───────────────────┘
                   │
                   ▼
┌────────────────────────────────────────────────────────┐
│ Structured JSON Output:                                │
│  {                                                     │
│    "category": "Interview Invitation",                 │
│    "priority": "P1",                                   │
│    "confidenceScore": 96,                              │
│    "summary": "Invited for Technical Round 1 on Zoom", │
│    "actionRequired": "Select time slot by Thursday",   │
│    "deadline": "2026-08-20T17:00:00Z",                 │
│    "sentiment": "Positive",                            │
│    "suggestedReply": "Hi Sarah, thank you for..."      │
│  }                                                     │
└──────────────────┬─────────────────────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────────────────────┐
│  • Saved to MongoDB (CategorizedEmail Collection)      │
│  • Rendered in React Categorizer Kanban / Table View   │
│  • 1-Click "Send Suggested Reply" via Nodemailer       │
└────────────────────────────────────────────────────────┘
```

---

### Backend API & Database Schema

#### Mongoose Schema (`backend/models/CategorizedEmail.js`)

```javascript
const mongoose = require("mongoose");

const categorizedEmailSchema = new mongoose.Schema(
  {
    senderName: { type: String, trim: true },
    senderEmail: { type: String, trim: true },
    subject: { type: String, required: true, trim: true },
    rawContent: { type: String, required: true },
    category: {
      type: String,
      enum: [
        "Interview Invitation",
        "Job Offer / Assessment",
        "Recruiter Outreach / Lead",
        "Action / Follow-Up Needed",
        "Application Rejection",
        "Newsletter & General",
        "Spam / Irrelevant",
      ],
      required: true,
    },
    priority: {
      type: String,
      enum: ["P1", "P2", "P3", "P4", "P5", "P0"],
      default: "P3",
    },
    confidenceScore: { type: Number, min: 0, max: 100 },
    summary: { type: String, trim: true },
    actionRequired: { type: String, trim: true },
    deadline: { type: String, trim: true },
    sentiment: {
      type: String,
      enum: ["Positive", "Neutral", "Urgent", "Rejection", "Negative"],
      default: "Neutral",
    },
    suggestedReply: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CategorizedEmail", categorizedEmailSchema);
```

#### New Endpoints to Implement

| Method | Endpoint | Description |
|:---|:---|:---|
| `POST` | `/api/categorize` | Analyzes email text using Gemini, returns category & suggested reply, saves to DB. |
| `GET` | `/api/categorize` | Fetches all categorized emails (supports `?category=Interview Invitation` & `?priority=P1`). |
| `POST` | `/api/categorize/reply` | Directly sends the AI-suggested smart reply to the sender using Nodemailer. |
| `DELETE` | `/api/categorize/:id` | Deletes a categorized email entry. |

---

### AI Prompt Engineering & JSON Output

In `backend/services/aiService.js`, add a dedicated function `categorizeEmailContent({ emailText, subject, sender })`:

```javascript
const categorizeEmailContent = async ({ emailText, subject, sender }) => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.2,
    },
  });

  const prompt = `
You are an expert AI Email Assistant. Read the following email content carefully and categorize it accurately.

Sender: ${sender || "Unknown"}
Subject: ${subject || "No Subject"}
Email Content:
"""
${emailText}
"""

Classify the email into EXACTLY one of these categories:
1. "Interview Invitation" (if it contains interview invitations, screening calls, or meeting scheduling)
2. "Job Offer / Assessment" (if it includes job offers, contracts, OA tests, or coding assessments)
3. "Recruiter Outreach / Lead" (if a recruiter reaches out regarding an open role or requests a resume)
4. "Action / Follow-Up Needed" (if the sender requires documents, replies, or specific action)
5. "Application Rejection" (if it states they are not moving forward with the application)
6. "Newsletter & General" (if it is a generic newsletter, update, or company announcement)
7. "Spam / Irrelevant" (if it is unsolicited marketing or spam)

Return ONLY a JSON object matching this schema:
{
  "category": string (one of the 7 exact strings above),
  "priority": "P1" | "P2" | "P3" | "P4" | "P5" | "P0",
  "confidenceScore": number (0-100),
  "summary": string (1-2 sentence core summary of the email),
  "actionRequired": string (what action the user must take, or "None"),
  "deadline": string (any stated deadline or timeframe, or "None"),
  "sentiment": "Positive" | "Neutral" | "Urgent" | "Rejection" | "Negative",
  "suggestedReply": string (a professional, polite response ready to send back to the sender)
}
`;

  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
};
```

---

### Step-by-Step Implementation Roadmap

```
┌────────────────────────────────────────────────────────────────────────┐
│                    SCALE-UP IMPLEMENTATION PHASES                      │
├────────────────────────────────────────────────────────────────────────┤
│ Phase 1: Backend Categorization Engine                                 │
│   [ ] Create backend/models/CategorizedEmail.js                        │
│   [ ] Add categorizeEmailContent() in backend/services/aiService.js    │
│   [ ] Create backend/controllers/categoryController.js                 │
│   [ ] Register /api/categorize in backend/routes/categoryRoutes.js     │
│                                                                        │
│ Phase 2: Frontend Categorization Tab & UI                              │
│   [ ] Add Tab Navigation to frontend (Outreach vs. Categorizer)        │
│   [ ] Build "Analyze & Categorize Email" input panel                   │
│   [ ] Build Category Badges filter pills (All, P1, Interviews, etc.)  │
│   [ ] Build Email Detail Modal with "1-Click Send Smart Reply" button  │
│                                                                        │
│ Phase 3: Advanced Automation (Optional Next Step)                      │
│   [ ] IMAP / Gmail OAuth integration to auto-fetch unread inbox emails │
│   [ ] Automated webhook or cron-job categorization pipeline            │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Project Directory Structure

```
Sendora/
├── backend/
│   ├── config/
│   │   └── db.js                    # Resilient MongoDB Atlas connection
│   ├── controllers/
│   │   ├── emailController.js       # Outreach handlers (generate & send)
│   │   └── categoryController.js    # (Upcoming) Email categorization handlers
│   ├── models/
│   │   ├── EmailLog.js              # Sent outreach logs
│   │   └── CategorizedEmail.js      # (Upcoming) Categorized inbox emails
│   ├── routes/
│   │   ├── emailRoutes.js           # /api/emails/*
│   │   └── categoryRoutes.js        # (Upcoming) /api/categorize/*
│   ├── services/
│   │   ├── aiService.js             # Gemini AI email generation & categorization
│   │   └── emailService.js          # Nodemailer + rich HTML signatures
│   ├── server.js                    # Express app entry point (port 7000)
│   ├── package.json
│   └── .env                         # Secrets and credentials
│
└── frontend/
    ├── src/
    │   ├── App.jsx                  # Main UI with Outreach & Categorizer views
    │   ├── index.css                # Glassmorphism dark-mode design system
    │   └── main.jsx                 # React 19 entry point
    ├── vite.config.js               # Dev server proxy (:7000)
    └── package.json
```

---

## Current API Reference

### Email Outreach Endpoints
- **`POST /api/emails/generate`**
  - **Body**: `{ "jobRequirement": "...", "recruiterName": "..." }`
  - **Response**: `{ "subject": "...", "body": "..." }`
- **`POST /api/emails/send`**
  - **Body**: `{ "recruiterName": "...", "recruiterEmail": "...", "jobRequirement": "...", "subject": "...", "body": "...", "senderName": "...", "linkedin": "...", "resumeLink": "...", "github": "...", "leetcode": "..." }`
  - **Response**: `{ "message": "Email sent successfully!", "messageId": "..." }`
- **`GET /api/emails`**
  - **Response**: Array of the last 50 sent email logs from MongoDB.

---

## Setup & Local Development

### 1. Prerequisites
- **Node.js**: v18 or higher
- **Gmail Account**: With an App Password generated ([Google App Passwords](https://myaccount.google.com/apppasswords))
- **Gemini API Key**: ([Google AI Studio](https://aistudio.google.com/app/apikey))
- **MongoDB Atlas Cluster**: ([MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

### 2. Configure Backend `.env`
Create `backend/.env`:
```env
PORT=7000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/sendora
GEMINI_API_KEY=your_gemini_api_key

USER_NAME="Rahul Prasad"
USER_ROLE="Full Stack Developer"
USER_SKILLS="Node.js, Express, MongoDB, React, C#, ASP.NET Core"
USER_RESUME_SUMMARY="Detail-oriented developer with experience building full-stack web applications."

SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_char_app_password
```

### 3. Install Dependencies & Run

```bash
# Terminal 1 — Backend:
cd backend
npm install
npm run dev

# Terminal 2 — Frontend:
cd frontend
npm install
npm run dev
```

App opens at: **`http://localhost:3000`** (Proxied automatically to backend at `:7000`).

---

## Environment Variables Reference

| Variable | Required | Description |
|---|:---:|---|
| `PORT` | No | Backend port (default `7000`) |
| `MONGO_URI` | No* | MongoDB Atlas connection string (app runs gracefully without it) |
| `GEMINI_API_KEY` | No* | Google AI API Key (smart fallback template used if absent) |
| `USER_NAME` | Yes | Your name (used in AI prompt & signature) |
| `USER_ROLE` | Yes | Your current role / title |
| `USER_SKILLS` | Yes | List of your core skills |
| `USER_RESUME_SUMMARY` | Yes | Short summary of your experience |
| `SMTP_HOST` | Yes | SMTP server (`smtp.gmail.com`) |
| `SMTP_PORT` | Yes | SMTP port (`465` for SSL, `587` for TLS) |
| `SMTP_USER` | Yes | Your sender Gmail address |
| `SMTP_PASS` | Yes | 16-character Gmail App Password |

---

## Author

**Rahul Prasad**
- **LinkedIn**: [linkedin.com/in/rahulprasad](https://www.linkedin.com/in/rahul-prasad-/)
- **GitHub**: [github.com/RahulPrasad-78](https://github.com/RahulPrasad-78)
- **LeetCode**: [leetcode.com/u/Rahul__78](https://leetcode.com/u/Rahul__78/)
