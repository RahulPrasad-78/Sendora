# Project Progress Log: AutoEmail Bot

> [!IMPORTANT]
> **🤖 INSTRUCTIONS FOR THE AI ASSISTANT (READ THIS FIRST):**
> 1. **Do not write the complete code.** The user wants to learn and build this project themselves.
> 2. **Socratic / Guided Approach**: Give hints, conceptual explanations, and folder structures. Let the user write the implementation and ask questions.
> 3. **Step-by-Step**: Maintain the current active task in [tasks.md](file:///C:/Users/ravis/Desktop/AutoEmail/tasks.md). Only update it to the next step once the user successfully completes the active task.
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

---

## Current Status
- **Current Task**: Step 2 - Database Model & Sent Emails API.
- **Completed Tasks**:
  - Step 1 - Initializing Node.js project, folder structure, and database connection (Completed 2026-07-14).
- **Blockers/Questions**: None.
