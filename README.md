# Sendora — AI Email Outreach & Smart Categorization Suite

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
![Gemini](https://img.shields.io/badge/Google%20Gemini-2.0%20Flash-4285F4?logo=google&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![License](https://img.shields.io/badge/License-ISC-blue)

**Sendora** is a full-stack AI-powered email automation platform with three integrated modules: personalized cold outreach, AI resume generation, and intelligent email triage — all in a single glassmorphism dark-mode UI.

</div>

---

## ✨ Features at a Glance

| Module | Status | Description |
|:---|:---:|:---|
| 📤 **Cold Email Outreach Engine** | ✅ Live | AI-crafts hyper-personalized emails from job descriptions & sends via Gmail SMTP |
| 📄 **AI Resume Builder** | ✅ Live | Generates tailored XeLaTeX PDFs, stores in MongoDB, attaches to outreach emails |
| 🧠 **Dynamic Knowledge Base Studio** | ✅ Live | In-app MongoDB editor for Project READMEs (.md), GitHub repo auto-sync & Master LaTeX Resume |
| 🗂️ **Email Categorizer & Triage** | ✅ Live | Classifies inbound emails, extracts deadlines & actions, drafts smart replies |

---

## 📑 Table of Contents

- [System Architecture](#system-architecture)
- [Module 1: Cold Email Outreach](#module-1-cold-email-outreach)
- [Module 2: AI Resume Builder](#module-2-ai-resume-builder)
- [Module 3: Dynamic Knowledge Base Studio](#module-3-dynamic-knowledge-base-studio)
- [Module 4: Email Categorizer & Triage](#module-4-email-categorizer--triage)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Setup & Local Development](#setup--local-development)
- [Environment Variables](#environment-variables)
- [Tech Stack](#tech-stack)
- [Author](#author)

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                    SENDORA WEB APP                                      │
├──────────────────────┬─────────────────────────────┬───────────────────────────────────┤
│   MODULE 1           │   MODULE 2                  │   MODULE 3                        │
│   Cold Outreach      │   AI Resume Builder         │   Email Categorizer               │
│                      │                             │                                   │
│ • Paste Job Desc.    │ • Paste Job Desc.           │ • Paste Inbound Email             │
│ • AI crafts email    │ • AI tailors LaTeX resume   │ • AI classifies & summarizes      │
│ • Edit preview       │ • Compiles to PDF           │ • Extracts actions & deadlines    │
│ • Send via SMTP      │ • Attach to outreach emails │ • Drafts 1-click smart reply      │
└──────────┬───────────┴────────────────┬────────────┴──────────────┬────────────────────┘
           │                            │                           │
           ▼                            ▼                           ▼
  POST /api/emails/generate    POST /api/resumes/generate  POST /api/categorize
  POST /api/emails/send         GET /api/resumes             GET /api/categorize
   GET /api/emails               GET /api/resumes/:id/pdf
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                   BACKEND SERVICES                                      │
│  • aiService.js       : Google Gemini 2.0 Flash — email generation & categorization    │
│  • resumeService.js   : Knowledge-base parsing & XeLaTeX PDF compilation               │
│  • emailService.js    : Nodemailer SMTP with PDF attachments & HTML signatures         │
│  • MongoDB Atlas      : EmailLog, TailoredResume, CategorizedEmail collections         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Module 1: Cold Email Outreach

Paste a job description, and Sendora's AI writes a targeted, personalized cold email — then sends it via Gmail SMTP in one click.

### How it works

1. **Fill recruiter details** — name and email address.
2. **Paste the job description** — any format works.
3. **Generate** — Gemini 2.0 Flash analyzes your profile (from `.env`) and the JD to craft a compelling subject + body.
4. **Edit the preview** — tweak anything before sending.
5. **Attach a resume** — generate a new AI-tailored resume or pick one from your MongoDB library.
6. **Send** — dispatched via Nodemailer (Gmail SMTP, port 465 SSL) with an auto-appended signature:
   - 💼 LinkedIn   |   📄 Resume   |   💻 GitHub   |   🧩 LeetCode
7. **History log** — all sent emails are saved to MongoDB and shown in a live table.

---

## Module 2: AI Resume Builder

Generates a custom, role-specific LaTeX resume from your master knowledge base — compiled to a binary PDF and stored in MongoDB.

### How it works

1. **Paste a job description** — the AI selects the most relevant projects and skills from your knowledge base.
2. **AI generates LaTeX** — a full XeLaTeX resume is produced using your `resume.tex` template.
3. **PDF compilation** — the backend compiles it with XeLaTeX and streams the binary PDF.
4. **MongoDB library** — every generated resume is saved; browse, preview, and download past resumes.
5. **Attach to outreach** — when sending a cold email, pick any saved resume to attach as a PDF.

> **Prerequisite**: XeLaTeX must be installed on the backend server for PDF compilation (`texlive-xetex` or MiKTeX).

---

## Module 3: Email Categorizer & Triage

Paste any inbound email (recruiter reply, rejection, offer, etc.) and Sendora's AI classifies it, extracts action items, and drafts a professional reply.

### Categorization Taxonomy & Priority Matrix

| Category | Priority | Description |
|:---|:---:|:---|
| 🎯 **Interview Invitation** | P1 — Critical | Interview scheduling, screen rounds, Zoom/Meet links |
| 💼 **Job Offer / Assessment** | P1 — Critical | Formal offers, OA links, HackerRank/Codility tests |
| 🤝 **Recruiter Outreach / Lead** | P2 — High | Recruiter inquiring about availability or requesting resume |
| ⏳ **Action / Follow-Up Needed** | P3 — Medium | Pending questions, salary queries, document submissions |
| 🚫 **Application Rejection** | P4 — Low | "Moved forward with other candidates" standard rejections |
| 📰 **Newsletter & General** | P5 — Low | Job alerts, platform digests, company announcements |
| 🛑 **Spam / Irrelevant** | P0 — None | Unsolicited marketing, bulk spam |

### AI Output Schema

Each categorized email returns a structured JSON object:

```json
{
  "category": "Interview Invitation",
  "priority": "P1",
  "confidenceScore": 96,
  "summary": "Invited for Technical Round 1 on Zoom this Thursday.",
  "actionRequired": "Select a time slot by Thursday",
  "deadline": "2026-08-20T17:00:00Z",
  "sentiment": "Positive",
  "suggestedReply": "Hi Sarah, thank you for reaching out..."
}
```

---

---

## Module 3: Dynamic Knowledge Base Studio (Complete & Active)

Manage your project portfolio and master resume without touching code or redeploying:

- **MongoDB Cloud Persistence**: Store project READMEs (`.md`) and Master ATS LaTeX template (`.tex`) in MongoDB Atlas.
- **GitHub Live Import**: Paste any public repository URL (`https://github.com/username/repo`) to auto-fetch the live README.
- **AI Selection Toggle**: Turn projects on or off with a single click to control which projects Gemini highlights.
- **Hybrid Fallback**: Loads from MongoDB first; automatically falls back to local disk if running offline.

---

## Module 4: Email Categorizer & Triage (Complete & Active)

Processes inbound recruiter messages, assessment links, and interview invites:

- **7-Category Classification**: Interviews (P1), Job Offers/Assessments (P1), Recruiter Leads (P2), Follow-ups (P3), Rejections (P4), Newsletters (P5), Spam (P0).
- **Deadline & Action Extraction**: Surfaces test deadlines, interview dates, and required next steps.
- **1-Click Smart Reply**: AI drafts polite, ready-to-send replies dispatched via Nodemailer.

---

## Project Structure

```
Sendora/
├── backend/
│   ├── config/
│   │   └── db.js                    # MongoDB Atlas connection with graceful fallback
│   ├── controllers/
│   │   ├── emailController.js       # Outreach generation, sending & history
│   │   ├── resumeController.js      # Resume generation, PDF streaming & MongoDB storage
│   │   ├── categoryController.js   # Inbound email categorization & triage
│   │   └── knowledgeController.js  # Dynamic project READMEs & Master Resume management
│   ├── models/
│   │   ├── EmailLog.js              # Sent outreach logs
│   │   ├── TailoredResume.js        # Tailored resumes (LaTeX source + base64 PDF)
│   │   ├── CategorizedEmail.js      # Categorized inbound emails & triage data
│   │   ├── ProjectReadme.js         # Stored project READMEs (markdown + tech tags)
│   │   └── MasterResume.js          # Master ATS LaTeX resume template
│   ├── routes/
│   │   ├── emailRoutes.js           # /api/emails/*
│   │   ├── resumeRoutes.js          # /api/resumes/*
│   │   ├── categoryRoutes.js        # /api/categorize/*
│   │   └── knowledgeRoutes.js       # /api/knowledge/*
│   ├── services/
│   │   ├── aiService.js             # Gemini 2.0 Flash — email & categorization AI
│   │   ├── resumeService.js         # Knowledge-base parsing & XeLaTeX compilation
│   │   └── emailService.js          # Nodemailer SMTP with PDF attachments & signatures
│   ├── knowledge-base/
│   │   ├── resume.tex               # Seed base LaTeX resume
│   │   ├── kyvernitis-resume.cls    # Custom resume document class
│   │   └── readmes/                 # Seed project READMEs
│   ├── server.js                    # Express app entry point (port 7000)
│   ├── .env.example                 # Environment setup template
│   └── .env                         # Environment secrets (not committed)
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ResumeBuilder.jsx          # AI Resume Builder UI & MongoDB library
│   │   │   └── KnowledgeBaseManager.jsx   # Dynamic Knowledge Base Studio & GitHub Importer
│   │   ├── App.jsx                  # Main app — Outreach, Resume Builder, Knowledge Base, Categorizer
│   │   ├── index.css                # Glassmorphism dark-mode design system
│   │   └── main.jsx                 # React 19 entry point
│   ├── vite.config.js               # Dev server with /api proxy to :7000
│   └── package.json
│
├── sendora-overview.html            # Interactive architecture documentation
└── package.json                     # Root orchestrator scripts
```

---

## API Reference

### Email Outreach (`/api/emails`)

| Method | Endpoint | Body / Params | Description |
|:---:|:---|:---|:---|
| `POST` | `/api/emails/generate` | `{ jobRequirement, recruiterName }` | Generate a personalized email subject & body via AI |
| `POST` | `/api/emails/send` | `{ recruiterName, recruiterEmail, jobRequirement, subject, body, attachResume, resumeMode, selectedResumeId }` | Send via Nodemailer SMTP; optionally attach a PDF resume |
| `GET` | `/api/emails` | — | Fetch all sent email logs from MongoDB |

### Resume Builder (`/api/resumes`)

| Method | Endpoint | Body / Params | Description |
|:---:|:---|:---|:---|
| `POST` | `/api/resumes/generate` | `{ jobDescription }` | Generate & compile a tailored PDF resume; save to MongoDB |
| `GET` | `/api/resumes` | — | Fetch all saved resumes (excludes heavy base64 for speed) |
| `GET` | `/api/resumes/:id/pdf` | `:id` | Stream the binary PDF directly from MongoDB |
| `DELETE` | `/api/resumes/:id` | `:id` | Delete a saved resume |
| `GET` | `/api/resumes/status` | — | Check master resume, project READMEs & XeLaTeX compiler status |

### Knowledge Base Studio (`/api/knowledge`)

| Method | Endpoint | Body / Params | Description |
|:---:|:---|:---|:---|
| `GET` | `/api/knowledge/projects` | — | Fetch all project READMEs from MongoDB (auto-seeds from disk if empty) |
| `POST` | `/api/knowledge/projects` | `{ title, content, techStack, repoUrl, tagline }` | Save new project README to MongoDB |
| `PUT` | `/api/knowledge/projects/:id` | `{ title, content, techStack, isFeatured }` | Update existing project README |
| `DELETE` | `/api/knowledge/projects/:id` | `:id` | Delete project README from MongoDB |
| `POST` | `/api/knowledge/projects/github-import` | `{ repoUrl }` | Fetch live README.md directly from a GitHub repository |
| `GET` | `/api/knowledge/master-resume` | — | Get master ATS LaTeX resume template |
| `POST` | `/api/knowledge/master-resume` | `{ latexContent, title }` | Save master ATS LaTeX resume to MongoDB |
| `POST` | `/api/knowledge/master-resume/reset` | — | Reset master resume back to default disk template |

### Email Categorizer (`/api/categorize`)

| Method | Endpoint | Body / Params | Description |
|:---:|:---|:---|:---|
| `POST` | `/api/categorize` | `{ rawContent, subject, senderName }` | Categorize email via AI — returns full triage JSON |
| `GET` | `/api/categorize` | `?category=...&priority=...` | Fetch all categorized emails with optional filters |
| `POST` | `/api/categorize/reply` | `{ id }` | Send the AI-suggested smart reply to the sender |
| `DELETE` | `/api/categorize/:id` | `:id` | Delete a categorized email entry |

### Health Check

| Method | Endpoint | Description |
|:---:|:---|:---|
| `GET` | `/api/health` | Returns `{ status: "ok", timestamp }` — used by frontend to detect backend status |

---

## Setup & Local Development

### 1. Prerequisites

- **Node.js** v18 or higher
- **Gmail Account** with a 16-character [App Password](https://myaccount.google.com/apppasswords) *(2-Step Verification must be enabled)*
- **Google Gemini API Key** → [Google AI Studio](https://aistudio.google.com/app/apikey)
- **MongoDB Atlas Cluster** → [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) *(free tier works fine)*
- **XeLaTeX** *(optional — required only for AI Resume Builder PDF compilation)*
  - **Windows**: [MiKTeX](https://miktex.org/download)
  - **Ubuntu/Debian**: `sudo apt install texlive-xetex`
  - **macOS**: `brew install --cask mactex`

### 2. Clone the repository

```bash
git clone https://github.com/RahulPrasad-78/Sendora.git
cd Sendora
```

### 3. Configure environment variables

Copy `.env.example` to `backend/.env`:

```bash
# Linux / macOS / Git Bash:
cp .env.example backend/.env

# Windows PowerShell:
Copy-Item .env.example backend/.env
```

Fill in your credentials in `backend/.env` (see [Environment Variables](#environment-variables) below).

### 4. Install all dependencies

Run this single command from the root directory:

```bash
npm run install:all
```

This installs root, backend, and frontend packages in one go.

### 5. Run both servers

```bash
npm run dev
```

| Service | URL |
|:---|:---|
| Frontend (Vite) | http://localhost:3000 |
| Backend (Express) | http://localhost:7000 |

The Vite dev server automatically proxies all `/api` requests to the backend.

---

## Environment Variables

Copy `.env.example` to `backend/.env` and fill in the values below.

| Variable | Required | Description |
|:---|:---:|:---|
| `PORT` | No | Backend port (default: `7000`) |
| `MONGO_URI` | No* | MongoDB Atlas connection string — app runs gracefully without it |
| `GEMINI_API_KEY` | No* | Google AI API key — falls back to a template email if absent |
| `USER_NAME` | Yes | Your full name — used in AI prompts & email signatures |
| `USER_ROLE` | Yes | Your current role/title |
| `USER_SKILLS` | Yes | Comma-separated list of your core skills |
| `USER_RESUME_SUMMARY` | Yes | Short bio used by AI for personalization |
| `USER_LINKEDIN` | Yes | LinkedIn profile URL |
| `USER_GITHUB` | Yes | GitHub profile URL |
| `USER_RESUME` | Yes | Google Drive (or other) link to your resume PDF |
| `USER_LEETCODE` | Yes | LeetCode profile URL |
| `SMTP_HOST` | Yes | SMTP server (`smtp.gmail.com`) |
| `SMTP_PORT` | Yes | `465` for SSL, `587` for TLS |
| `SMTP_USER` | Yes | Sender Gmail address |
| `SMTP_PASS` | Yes | 16-character Gmail App Password |
| `SMTP_FROM` | Yes | From address (usually same as `SMTP_USER`) |

---

## Tech Stack

| Layer | Technology |
|:---|:---|
| **Frontend** | React 19, Vite 8, Lucide React, Glassmorphism CSS |
| **Backend** | Node.js, Express 5, Nodemailer |
| **AI** | Google Gemini 2.0 Flash (`@google/generative-ai`) |
| **Database** | MongoDB Atlas + Mongoose 9 |
| **PDF Generation** | XeLaTeX (via `resumeService.js`) |
| **Dev tooling** | Nodemon, Concurrently, oxlint |

---

## Author

**Rahul Prasad**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-rahul--prasad-0077B5?logo=linkedin&logoColor=white)](https://www.linkedin.com/in/rahul-prasad-/)
[![GitHub](https://img.shields.io/badge/GitHub-RahulPrasad--78-181717?logo=github&logoColor=white)](https://github.com/RahulPrasad-78)
[![LeetCode](https://img.shields.io/badge/LeetCode-Rahul__78-FFA116?logo=leetcode&logoColor=white)](https://leetcode.com/u/Rahul__78/)
