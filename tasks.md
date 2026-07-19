# Step-by-Step Build Tasks

This file outlines the tasks you need to complete. We will tackle them one by one. Once you complete the active task, tell me, and we will review it and update this file with the next task.

---

## 🛠️ ACTIVE TASK: Step 4 - SMTP Configuration & Email Sending via Nodemailer

Your goal is to integrate Nodemailer to send actual emails and automatically record their dispatch status (Success or Failed) to MongoDB.

### 📋 Checklist
1. **Install Nodemailer**:
   - Open your terminal in the `backend/` folder and run:
     ```bash
     npm install nodemailer
     ```
2. **Add SMTP Environment Variables** in `backend/.env`:
   - Add your email server configurations:
     ```env
     SMTP_HOST=smtp.gmail.com
     SMTP_PORT=465
     SMTP_USER=your_email@gmail.com
     SMTP_PASS=your_gmail_app_password
     ```
   - *Note on Gmail*: Do NOT use your primary password. Instead, enable 2-Step Verification on your Google Account, search for "App Passwords" in your account settings, and generate a 16-character password specifically for this app.
3. **Create the Email Sending Service** (`backend/services/emailService.js`):
   - Import `nodemailer`.
   - Initialize a transporter using the SMTP details in your `.env` file.
   - Implement a function `sendEmail({ to, subject, body })` that sends the email.
4. **Create a Send & Log Endpoint**:
   - Implement a new controller function (e.g. `sendRecruiterEmail`) in `backend/controllers/emailController.js` and map it to `POST /api/emails/send` in `backend/routes/emailRoutes.js`.
   - The handler should:
     1. Extract `recruiterName`, `recruiterEmail`, `subject`, and `body` from the request.
     2. Attempt to send the email using your `sendEmail` service function.
     3. **If successful**: Save a new record in MongoDB (`EmailLog`) with `status: 'Success'` and all the email details.
     4. **If failed**: Catch the error and save the record with `status: 'Failed'` and the error details.
     5. Return the created log to the client.
5. **Test Your Work**:
   - Start your server and trigger `POST /api/emails/send` via Postman with the details generated in Step 3. Verify that:
     - The email is successfully delivered to the target address.
     - A log entry with the correct `Success` or `Failed` status is saved in MongoDB.

### 💡 Learn & Think
- **HTML vs Text**: How can we structure our email template inside Nodemailer to support clean spacing, paragraphs, and links (like a LinkedIn profile)?

---

## ✅ COMPLETED TASKS
* **Step 1 - Project Initialization & Server Setup** (Completed 2026-07-14)
* **Step 2 - Database Model & Sent Emails API** (Completed 2026-07-19)
* **Step 3 - AI Email Generation Integration** (Completed 2026-07-19)

---

### 📬 How to Proceed
Write the code for Step 4! When you are done:
1. Let me know which files you created/modified.
2. Share your Nodemailer configurations or controller code, or ask me to check them.
3. Once we verify everything is working, we will move to Step 5 (CSV Import to load lists of recruiters in bulk!).
