# Step-by-Step Build Tasks

This file outlines the tasks you need to complete. We will tackle them one by one. Once you complete the active task, tell me, and we will review it and update this file with the next task.

---

## 🛠️ ACTIVE TASK: Step 2 - Database Model & Sent Emails API

Your goal is to define a single Mongoose schema for storing the logs of sent emails and create simple Express API routes to retrieve and record these logs.

### 📋 Checklist
1. **Create the EmailLog Model** (`backend/models/EmailLog.js`):
   - Define a schema to represent an email that was sent out.
   - Fields should include:
     - `recruiterName` (String)
     - `recruiterEmail` (String, required)
     - `subject` (String, required)
     - `body` (String, required)
     - `sentAt` (Date, default: Date.now)
     - `status` (String, enum: `['Success', 'Failed']`, default: `'Success'`)
     - `error` (String - for failure messages if sending fails)
2. **Build Email API Routes & Controllers**:
   - Create `backend/controllers/emailController.js` with functions to:
     - `getEmailLogs`: Retrieve the history of all sent emails.
     - `createEmailLog`: Manually add a log entry (used to save sent email details).
   - Create `backend/routes/emailRoutes.js` to route HTTP requests (`GET /` and `POST /`) to your controllers.
3. **Mount Routes in Server**:
   - In [server.js](file:///C:/Users/ravis/Desktop/Sendora/backend/server.js), import `emailRoutes` and mount them with `app.use('/api/emails', emailRoutes)`.
   - Ensure `express.json()` middleware is mounted in [server.js](file:///C:/Users/ravis/Desktop/Sendora/backend/server.js) so you can receive JSON payloads in POST requests.
4. **Test Your Work**:
   - Start your server and test the `POST /api/emails` and `GET /api/emails` endpoints using Postman or curl to ensure you can save a log and retrieve it from MongoDB.

### 💡 Learn & Think
- **Why keep it simple?** How does minimizing our database structure speed up our development of a MVP (Minimum Viable Product)?

---

## ✅ COMPLETED TASKS
* **Step 1 - Project Initialization & Server Setup** (Completed 2026-07-14)

---

### 📬 How to Proceed
Write the code for Step 2! When you are done:
1. Let me know which files you created/modified.
2. Share your schemas or router code, or ask me to check them.
3. Once we verify everything is working, we will move to Step 3 (integrating the LLM API for personalized email generation!).

