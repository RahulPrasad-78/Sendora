# Automated Cold-Email Job Outreach Bot

System design, tech-stack recommendation, database models, and a build roadmap for a Node.js-based automated recruiter outreach tool.

> **Note:** This tool is meant for personalized, low-volume, opt-out-friendly outreach to recruiters — not bulk/unsolicited spam. Keep volumes modest, personalize each email, and honor unsubscribe/opt-out requests. See [Sending Etiquette & Deliverability](#7-sending-etiquette--deliverability) before running this at scale.

---

## Table of Contents
1. [Language & Stack Recommendation](#1-language--stack-recommendation)
2. [System Design — Flowchart](#2-system-design--flowchart)
3. [Tools & Libraries You'll Need](#3-tools--libraries-youll-need)
4. [Database Models](#4-database-models)
5. [Minimal REST API](#5-minimal-rest-api-express)
6. [Build Roadmap](#6-build-roadmap-suggested-order)
7. [Sending Etiquette & Deliverability](#7-sending-etiquette--deliverability)

---

## 1. Language & Stack Recommendation

**Short answer: stick with Node.js + Express + Nodemailer + MongoDB.** Don't pick up Spring Boot for this project. Here's the reasoning.

### Why not Spring Boot right now
Spring Boot is a solid framework, but learning a new language ecosystem (Java) while also building the project and job-hunting will slow you down the most at the exact moment speed matters. You're optimizing for landing interviews soon, not for learning a new backend framework. Java/Spring also doesn't currently appear on your target job listings' primary stack (.NET / MERN) — so it won't move the needle on your resume story either.

### Why Node.js + Nodemailer is the right call
- You already know it — Express + MongoDB is part of your MERN stack (used in ShopNow), so there's zero ramp-up time.
- Nodemailer is purpose-built for exactly this: sending templated emails via SMTP (Gmail, Outlook, SendGrid, etc.) with attachments (your resume PDF).
- `node-cron` gives you free task scheduling to run batches daily without a separate scheduler service.
- It runs great as a simple script on your PC to start with — no server hosting needed yet.

### A stronger alternative worth considering: ASP.NET Core Web API
Since your target roles are fresher .NET / full-stack, there's a case for building this in ASP.NET Core Web API + EF Core + SQL Server instead. You already know this stack deeply (Horizon LMS, waggles-petshop), and it would give you a *third* portfolio project that directly matches the jobs you're applying to — which can come up naturally in interviews ("I built a tool to automate my own job search"). Use **MailKit** (the .NET equivalent of Nodemailer) for sending mail.

**Trade-off:** since you're less "instantly fluent" in wiring up a fresh ASP.NET Core project from zero compared to Node, it will take a bit longer to get the first version running.

> **Recommendation:** build v1 in Node.js this week to get it working and actually sending emails fast. Once it's stable, a .NET rewrite/v2 becomes a great portfolio piece with no time pressure.

| Criteria | Node.js + Nodemailer | ASP.NET Core + MailKit | Spring Boot |
|---|---|---|---|
| Your familiarity | High | High | None |
| Time to first working version | Fastest | Fast | Slowest |
| Resume/portfolio relevance | Medium (MERN) | High (.NET target) | Low |
| Good for this deadline? | Yes — build first | Yes — build after v1 | Not now |

---

## 2. System Design — Flowchart

End-to-end flow: import contacts → store in DB → scheduler runs daily → template personalizes each email → Nodemailer sends it → status is written back to the database → an optional inbox checker updates reply/bounce status → everything is exposed through a small REST API you can later put a dashboard on.

```
Recruiter/Company Source List (CSV / Sheet / scraped list)
        │  name, company, role, email
        ▼
Import Script — parses source, validates emails, inserts as "Pending"
        ▼
Database (MongoDB) — Company / Contact records
        ▼
Scheduler (node-cron) — runs daily, picks N "Pending" records (rate-limited)
        ▼
Template Engine — fills {{name}}, {{company}}, {{role}} + attaches resume
        ▼
Nodemailer + SMTP (Gmail/SendGrid) — sends 1 email, waits before next
        ▼
   Send successful? ──No──▶ Log error, status = "Failed", retry next run
        │ Yes                              │
        ▼                                  │
   status = "Sent", sentAt = now()         │
        └──────────────┬───────────────────┘
                        ▼
           Database updated (single source of truth)
                        ▼
     Reply / Bounce Checker (IMAP, optional) — polls inbox,
     updates status = "Replied" / "Bounced"
                        ▼
     REST API (Express) — GET /applications, POST /companies,
     PATCH /applications/:id/status
                        ▼
     Dashboard / Frontend (later phase) — view applied companies,
     status, reply rate, follow-up reminders
```

---

## 3. Tools & Libraries You'll Need

| Purpose | Tool | Notes |
|---|---|---|
| Runtime | Node.js (v20+) | You already have this set up |
| Web framework | Express.js | For the REST API layer |
| Email sending | Nodemailer | SMTP transport — Gmail App Password or SendGrid/Mailgun |
| Database | MongoDB + Mongoose | Matches your MERN experience; easy schema for contacts |
| Scheduling | node-cron | Runs the daily send batch automatically |
| Templating | Handlebars or JS template strings | Fill `{{name}}`, `{{company}}`, `{{role}}` |
| Contact import | csv-parser or google-spreadsheet API | Load your recruiter list in bulk |
| Reply tracking (optional) | imap-simple / node-imap | Detects replies/bounces in your inbox |
| Env config | dotenv | Keep SMTP credentials out of source code |
| Rate limiting | p-queue or a delay loop | Avoid spam-filtering — space sends out |
| Resume attachment | Nodemailer `attachments` option | Attach your resume PDF automatically |
| Hosting (later) | Railway / Render / Azure App Service | When you're ready to stop running it on your PC |

---

## 4. Database Models

Two core collections are enough to start. Keep it simple — extend later once the basic loop (send → log → track) is working.

### Company / Contact model
One document per recruiter/company you plan to email.

```js
{
  companyName:   String,
  hrName:        String,          // optional, for personalization
  hrEmail:       String,          // required, unique
  jobTitle:      String,          // role you're applying for
  jobPostUrl:    String,          // optional link to the posting
  source:        String,          // "LinkedIn", "Indeed", "Company site" etc.
  status:        String,          // "Pending" | "Sent" | "Failed" | "Replied" | "Bounced"
  sentAt:        Date,
  repliedAt:     Date,
  followUpCount: Number,          // how many follow-ups sent
  notes:         String,
  createdAt:     Date
}
```

### Email Log model
One document per individual email sent, so you keep a full audit trail even if a company record is later updated or reused for a follow-up.

```js
{
  companyId:    ObjectId,   // ref -> Company
  subject:      String,
  body:         String,     // the exact personalized text sent
  attachment:   String,     // filename of resume version used
  sentAt:       Date,
  status:       String,     // "Sent" | "Failed" | "Bounced"
  errorMessage: String      // populated only if status = "Failed"
}
```

**Why split into two models?** The `Company` model tracks the current state of an application (what matters for your dashboard). The `EmailLog` model is an append-only history — handy if you ever send a follow-up email to the same company and want to see everything you sent them.

---

## 5. Minimal REST API (Express)

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/companies` | Add a company/contact manually |
| POST | `/api/companies/import` | Bulk import from CSV |
| GET | `/api/companies` | List all, filterable by status |
| POST | `/api/send/run` | Manually trigger a send batch (for testing) |
| PATCH | `/api/companies/:id/status` | Update status (e.g. mark Replied manually) |
| GET | `/api/stats` | Totals: sent, replied, bounced, reply rate |

This API is also exactly what you'll wire a React frontend to later, and it's a clean thing to demo on GitHub even before the frontend exists (Postman screenshots + README are enough for v1).

---

## 6. Build Roadmap (Suggested Order)

1. **Day 1 — Project skeleton**: Init Node project, connect MongoDB with Mongoose, define the `Company` schema, add a POST endpoint to manually add one company. Confirm it saves correctly.
2. **Day 1–2 — Nodemailer basics**: Set up Nodemailer with a Gmail App Password (not your real password). Send yourself a test email with a resume PDF attached before touching real recruiter addresses.
3. **Day 2 — Templating**: Write 2–3 email template variants (avoid sending the identical text every time — helps deliverability and looks less like a mail-merge to spam filters). Fill placeholders from the DB record.
4. **Day 3 — CSV import**: Write the import script for your recruiter list. Validate email format before insert. De-duplicate on `hrEmail`.
5. **Day 3–4 — Send loop + rate limiting**: Build the batch sender — pick N "Pending" records, send with a delay between each (e.g. 30–90 seconds), update status after each send, wrap each send in try/catch so one failure doesn't kill the batch.
6. **Day 4 — Scheduler**: Wire `node-cron` to run the batch once a day at a fixed time automatically.
7. **Day 5 — Stats/API polish**: Add the `/api/stats` endpoint and the remaining routes. Test everything with Postman.
8. **Later — Reply tracking**: Add IMAP polling to auto-detect replies/bounces (this is the most fiddly part — do it last, after the core loop is reliable).
9. **Later — Frontend**: Build a small React dashboard on top of the existing API.
10. **Later — .NET rewrite (optional)**: Once stable, rebuild the same system in ASP.NET Core + EF Core + MailKit as a second, portfolio-aligned version.

---

## 7. Sending Etiquette & Deliverability

- Keep daily volume modest (tens, not hundreds, per day) — this protects your sending address's reputation and avoids being flagged as spam.
- Personalize every email — use real name, company, and role fields. Never send an identical block of text to hundreds of addresses at once.
- Space sends out with a delay (30–90 seconds) instead of firing all at once.
- Use a dedicated sending address if possible, and warm it up gradually rather than blasting from day one.
- Always include a simple, genuine way to opt out or say "not interested" — good etiquette, and it keeps replies useful signal instead of noise.
- Double-check every recruiter email is one you sourced from a public job posting or company site — not a scraped/purchased list.
- Watch your bounce rate — a high bounce rate on a free Gmail account can get sending temporarily restricted.

One more thing worth saying directly: automating the sending is the easy part. The 600-cold-emails-per-offer number usually improves a lot with targeting and personalization quality, not just volume — so it's worth spending real time on 2–3 strong template variants rather than only on the pipeline.
