# Project Progress Log: AutoEmail Bot

> [!IMPORTANT]
> **🤖 INSTRUCTIONS FOR THE AI ASSISTANT (READ THIS FIRST):**
> 1. **Do not write the complete code.** The user wants to learn and build this project themselves.
> 2. **Socratic / Guided Approach**: Give hints, conceptual explanations, and folder structures. Let the user write the implementation and ask questions.
> 3. **Step-by-Step**: Maintain the current active task in [tasks.md](file:///C:/Users/ravis/Desktop/Sendora/tasks.md). Only update it to the next step once the user successfully completes the active task.
> 4. **No Code Dumps**: Keep code snippets minimal, explaining patterns rather than pasting whole files.

This file tracks the current state of our learning and building journey for the Automated Cold-Email Job Outreach Bot. It ensures we can resume exactly where we left off.

## Project Overview
- **Goal**: A MERN-based web application that uses AI (OpenAI or Gemini API) to generate job referral or vacancy requests to recruiters based on their name and email, send them via Nodemailer, and log the sent data to MongoDB.
- **Current Phase**: Phase 1 - Backend & Core Pipeline (CLI / Postman testing)
- **Tech Stack**: Node.js, Express, MongoDB (Mongoose), Nodemailer, OpenAI/Gemini API, dotenv.

## Session Log & Decisions

### 2026-07-14: Initialization
- **Action**: Read the original `README.md` and aligned on requirements.
- **Adjustment**: Noticed that the original `README.md` relied on static Handlebars templates (e.g., `{{name}}`, `{{company}}`). Since the goal is *AI-powered personalization* tailored to your resume and specific job posts, we decided to integrate an LLM API (like OpenAI or Gemini) to write the emails dynamically.
- **Agreed Learning Format**: Socratic/guided. The AI assistant will write step-by-step tasks in `tasks.md` rather than providing the full code directly. The user writes the code, and we iterate together.

### 2026-07-15: Simplification of Scope
- **Decision**: The user requested a simpler flow: they only want to provide the recruiter's name and email. The LLM will generate the outreach asking for job referrals or open positions. We will save only the sent email logs to MongoDB using a single model (`EmailLog`).

### 2026-07-19: Code Validation & API Verification
- **Action**: Reviewed the Step 2 implementation (models, controllers, routes, and server connection).
- **Validation**: All backend routing, controller actions, Mongoose schema fields, and Express configurations are implemented properly and effectively.
- **Issue Discovered**: Encountered a database connection crash (`MongooseServerSelectionError`) due to the MongoDB Atlas cluster's IP whitelist blocking connections from this local IP.
- **Resolution**: Whitelisted the IP on MongoDB Atlas. Re-tested the connection and verified that the server successfully prints `MongoDB Connected`. Ran tests against `POST /api/emails` and `GET /api/emails`, confirming both work perfectly.

### 2026-07-19: AI Integration, Model Retirement Diagnosis, and API Testing
- **Action**: Reviewed the Step 3 implementation (Gemini SDK integration, custom controllers/routes for email generation).
- **Debugging**:
  - Found that older models (like `gemini-1.5-flash` and `gemini-2.5-flash`) are retired or lack quota, throwing `404 Not Found` or `429 Too Many Requests`.
  - Identified `gemini-3.5-flash` as the fully accessible, working model in the user's region. Updated the configuration to target `gemini-3.5-flash`.
  - Fixed a JSON parsing issue caused by the model wrapping responses or returning intro/preamble. Added robust brace extraction to strip non-JSON wrapper content.
- **Result**: Successfully verified that calling `POST /api/emails/generate` uses the recruiter's name and the user's professional profile from `.env` to return a perfectly personalized outreach email structure in clean JSON.

---

## Current Status
- **Current Task**: Step 4 - SMTP Configuration & Email Sending via Nodemailer.
- **Completed Tasks**:
  - Step 1 - Initializing Node.js project, folder structure, and database connection (Completed 2026-07-14).
  - Step 2 - Database Model & Sent Emails API (Completed 2026-07-19).
  - Step 3 - AI Email Generation Integration (Completed 2026-07-19).
- **Blockers/Questions**: None.
