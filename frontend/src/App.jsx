import React, { useState, useEffect } from "react";
import {
  Send,
  Sparkles,
  Mail,
  Briefcase,
  FileText,
  Code,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Clock,
  ShieldCheck,
  Inbox,
  Filter,
  Search,
  Zap,
  Tag,
  Calendar,
  CheckCheck,
  Trash2,
  Copy,
  ExternalLink,
  MessageSquare,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

// Social Icons
const LinkedinIcon = ({ size = 14, color = "#0077b5" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const GithubIcon = ({ size = 14, color = "#a5b4fc" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

// Realistic Demo Email Samples for Quick Testing
const DEMO_EMAILS = [
  {
    label: "🎯 Google Interview",
    senderName: "Sarah Connor (Google Staffing)",
    senderEmail: "sconnor@google.com",
    subject: "Google Technical Screen: Software Engineer - Cloud Systems",
    rawContent:
      "Hi Rahul,\n\nI hope you're having a productive week! Our engineering team reviewed your profile and was very impressed by your background in full stack engineering and cloud platforms.\n\nWe would love to invite you for a 45-minute technical screening interview over Google Meet. Please review the available slots on my calendar link below and book a time that works best for you by this Thursday, 5:00 PM EST:\nhttps://meet.google.com/interview-booking-demo\n\nLooking forward to speaking soon!\n\nBest,\nSarah Connor\nTechnical Recruiter | Google",
  },
  {
    label: "💼 Stripe Coding Test",
    senderName: "Stripe Talent Team",
    senderEmail: "recruiting@stripe.com",
    subject: "Stripe Online Technical Assessment - Full Stack Role",
    rawContent:
      "Dear Rahul,\n\nThank you for applying to the Full Stack Engineer role at Stripe. We are excited to move forward with your candidacy!\n\nThe next step in our process is a 90-minute timed coding assessment hosted on HackerRank. Please complete the assessment within the next 48 hours:\nhttps://hackerrank.com/stripe-oa-assessment-demo\n\nIf you have any questions or need accommodations, feel free to reply to this email directly.\n\nBest regards,\nStripe Recruiting",
  },
  {
    label: "🤝 Amazon Recruiter Reachout",
    senderName: "Marcus Vance",
    senderEmail: "marcusv@amazon.jobs",
    subject: "Exciting Software Development Engineer II opportunity at Amazon AWS",
    rawContent:
      "Hi Rahul,\n\nI came across your GitHub and LinkedIn profiles and was very impressed by your projects with Node.js, React, and distributed systems. We are actively hiring SDE IIs for our AWS Developer Tools team in Seattle (Hybrid/Remote options).\n\nAre you open to discussing potential career opportunities with our hiring manager? If so, please share your updated resume and a convenient time to connect this week.\n\nBest regards,\nMarcus Vance\nSenior Tech Talent Partner, Amazon Web Services",
  },
  {
    label: "⏳ Meta Follow-Up",
    senderName: "Meta Recruiting Coordinator",
    senderEmail: "coordinator@meta.com",
    subject: "Action Required: Candidate Information Form for Upcoming Onsite",
    rawContent:
      "Hi Rahul,\n\nWe are currently preparing your upcoming virtual onsite loop for the Software Engineer position. Before we can finalize the interviewer schedules, we need you to fill out your preferred timezone and coding language preferences.\n\nPlease submit the candidate form before Friday noon:\nhttps://meta.careers/candidate-portal-form\n\nThank you,\nMeta Talent Operations",
  },
  {
    label: "🚫 Microsoft Status",
    senderName: "Microsoft Careers",
    senderEmail: "careers@microsoft.com",
    subject: "Update regarding your application for Software Engineer - Azure",
    rawContent:
      "Hi Rahul,\n\nThank you for taking the time to interview with our engineering team at Microsoft. While our team was very impressed by your qualifications and project experience, we have decided to move forward with another candidate whose background more closely matches the specific needs of this opening.\n\nWe will keep your resume in our talent network for future opportunities. We wish you the best in your job search.\n\nSincerely,\nMicrosoft Global Talent Acquisition",
  },
  {
    label: "📰 Weekly Tech Digest",
    senderName: "DevOps Weekly Digest",
    senderEmail: "newsletter@devopsdigest.io",
    subject: "Issue #248: Best practices in Kubernetes orchestration & Node.js 22",
    rawContent:
      "Hey developer!\n\nHere is your weekly roundup of top trending articles in cloud infrastructure, container optimization, and backend API performance. Click here to read full tutorials. To update your subscription or opt-out, click unsubscribe.",
  },
];

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState("categorizer"); // 'outreach' | 'categorizer'

  // --- OUTREACH STATE ---
  const [jobRequirement, setJobRequirement] = useState("");
  const [recruiterName, setRecruiterName] = useState("");
  const [recruiterEmail, setRecruiterEmail] = useState("");
  const [senderName, setSenderName] = useState("Rahul Prasad");
  const [linkedin, setLinkedin] = useState("https://www.linkedin.com/in/rahul-prasad-/");
  const [resumeLink, setResumeLink] = useState("https://drive.google.com/file/d/1krnyEIoKRe2B3kQsSvw_ztOPTpd9ya-f/view?usp=drive_link");
  const [github, setGithub] = useState("https://github.com/RahulPrasad-78");
  const [leetcode, setLeetcode] = useState("https://leetcode.com/u/Rahul__78/");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [outreachLogs, setOutreachLogs] = useState([]);
  const [isLoadingOutreachLogs, setIsLoadingOutreachLogs] = useState(false);

  // --- CATEGORIZER STATE ---
  const [catSenderName, setCatSenderName] = useState("");
  const [catSenderEmail, setCatSenderEmail] = useState("");
  const [catSubject, setCatSubject] = useState("");
  const [catRawContent, setCatRawContent] = useState("");
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [editedReply, setEditedReply] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [replyCopied, setReplyCopied] = useState(false);

  // Categorizer Inbox State
  const [categorizedList, setCategorizedList] = useState([]);
  const [isLoadingCatList, setIsLoadingCatList] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Shared UI Banner
  const [statusMessage, setStatusMessage] = useState(null);

  // Fetch Outreach Logs
  const fetchOutreachLogs = async () => {
    setIsLoadingOutreachLogs(true);
    try {
      const res = await fetch("/api/emails");
      if (res.ok) {
        const data = await res.json();
        setOutreachLogs(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.warn("Could not fetch outreach logs:", err);
    } finally {
      setIsLoadingOutreachLogs(false);
    }
  };

  // Fetch Categorized List
  const fetchCategorizedList = async () => {
    setIsLoadingCatList(true);
    try {
      const res = await fetch("/api/categorize");
      if (res.ok) {
        const data = await res.json();
        setCategorizedList(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.warn("Could not fetch categorized emails:", err);
    } finally {
      setIsLoadingCatList(false);
    }
  };

  useEffect(() => {
    fetchOutreachLogs();
    fetchCategorizedList();
  }, []);

  // --- OUTREACH HANDLERS ---
  const handleGenerateEmail = async (e) => {
    e.preventDefault();
    if (!jobRequirement.trim()) {
      setStatusMessage({ type: "error", text: "Please enter the Job Requirement details first." });
      return;
    }

    setIsGenerating(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/emails/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobRequirement,
          recruiterName: recruiterName || "Hiring Manager",
          recruiterEmail,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to generate email");

      setSubject(data.subject || "");
      setBody(data.body || "");
      setStatusMessage({
        type: "success",
        text: '✨ AI framed your email successfully! Review and click "Send Email via Nodemailer".',
      });
    } catch (err) {
      setStatusMessage({ type: "error", text: `Generation error: ${err.message}` });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!recruiterEmail.trim()) {
      setStatusMessage({ type: "error", text: "Recipient Email address is required to send." });
      return;
    }
    if (!subject.trim() || !body.trim()) {
      setStatusMessage({ type: "error", text: "Please generate or enter an email Subject and Body." });
      return;
    }

    setIsSending(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/emails/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recruiterName: recruiterName || "Hiring Manager",
          recruiterEmail,
          jobRequirement,
          subject,
          body,
          senderName,
          linkedin,
          resumeLink,
          github,
          leetcode,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send email");

      setStatusMessage({
        type: "success",
        text: `🚀 Email dispatched via Nodemailer to ${recruiterEmail}! Regards footer attached.`,
      });
      fetchOutreachLogs();
    } catch (err) {
      setStatusMessage({ type: "error", text: `Dispatch error: ${err.message}` });
    } finally {
      setIsSending(false);
    }
  };

  // --- CATEGORIZER HANDLERS ---
  const handleLoadDemoEmail = (demo) => {
    setCatSenderName(demo.senderName);
    setCatSenderEmail(demo.senderEmail);
    setCatSubject(demo.subject);
    setCatRawContent(demo.rawContent);
    setStatusMessage({
      type: "success",
      text: `Loaded sample: "${demo.label}". Click "Analyze & Categorize with AI" below!`,
    });
  };

  const handleCategorizeEmail = async (e) => {
    e.preventDefault();
    if (!catRawContent.trim()) {
      setStatusMessage({ type: "error", text: "Please paste the email content to categorize." });
      return;
    }

    setIsCategorizing(true);
    setStatusMessage(null);
    setReplyCopied(false);

    try {
      const res = await fetch("/api/categorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawContent: catRawContent,
          subject: catSubject || "No Subject",
          senderName: catSenderName || "Hiring Team",
          senderEmail: catSenderEmail || "",
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Categorization failed");

      setCurrentAnalysis(json.data);
      setEditedReply(json.data.suggestedReply || "");
      setStatusMessage({
        type: "success",
        text: `🧠 Email Classified: [${json.data.category}] with Priority ${json.data.priority} & ${json.data.confidenceScore}% confidence!`,
      });

      fetchCategorizedList();
    } catch (err) {
      setStatusMessage({ type: "error", text: `Categorization error: ${err.message}` });
    } finally {
      setIsCategorizing(false);
    }
  };

  const handleSendSmartReply = async () => {
    if (!catSenderEmail.trim()) {
      setStatusMessage({
        type: "error",
        text: "Sender email is missing. Please provide the sender's email to dispatch reply.",
      });
      return;
    }
    if (!editedReply.trim()) {
      setStatusMessage({ type: "error", text: "Reply body cannot be empty." });
      return;
    }

    setIsSendingReply(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/categorize/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailId: currentAnalysis?._id,
          recipientEmail: catSenderEmail,
          subject: catSubject || "Follow up",
          body: editedReply,
          senderName: senderName || "Rahul Prasad",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send smart reply");

      setStatusMessage({
        type: "success",
        text: `🚀 Smart reply dispatched via Nodemailer to ${catSenderEmail}!`,
      });
      fetchCategorizedList();
    } catch (err) {
      setStatusMessage({ type: "error", text: `Reply dispatch error: ${err.message}` });
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleCopyReply = () => {
    if (!editedReply) return;
    navigator.clipboard.writeText(editedReply);
    setReplyCopied(true);
    setTimeout(() => setReplyCopied(false), 2500);
  };

  const handleDeleteCategorized = async (id) => {
    try {
      await fetch(`/api/categorize/${id}`, { method: "DELETE" });
      setCategorizedList((prev) => prev.filter((item) => item._id !== id));
      if (currentAnalysis?._id === id) setCurrentAnalysis(null);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/categorize/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setCategorizedList((prev) =>
          prev.map((item) => (item._id === id ? { ...item, status: newStatus } : item))
        );
      }
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  // Filter categorized emails
  const filteredCategorized = categorizedList.filter((item) => {
    const matchesCategory =
      selectedCategoryFilter === "All" || item.category === selectedCategoryFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      (item.subject && item.subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.senderName && item.senderName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.summary && item.summary.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Calculate Metrics
  const totalEmails = categorizedList.length;
  const criticalP1Count = categorizedList.filter((e) => e.priority === "P1").length;
  const interviewCount = categorizedList.filter((e) => e.category === "Interview Invitation").length;
  const actionItemsCount = categorizedList.filter(
    (e) => e.actionRequired && e.actionRequired !== "None"
  ).length;

  const getCategoryClass = (category) => {
    switch (category) {
      case "Interview Invitation": return "cat-interview";
      case "Job Offer / Assessment": return "cat-offer";
      case "Recruiter Outreach / Lead": return "cat-outreach";
      case "Action / Follow-Up Needed": return "cat-followup";
      case "Application Rejection": return "cat-rejection";
      case "Newsletter & General": return "cat-newsletter";
      case "Spam / Irrelevant": return "cat-spam";
      default: return "cat-newsletter";
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case "P1": return "priority-p1";
      case "P2": return "priority-p2";
      case "P3": return "priority-p3";
      case "P4": return "priority-p4";
      case "P5": return "priority-p5";
      case "P0": return "priority-p0";
      default: return "priority-p3";
    }
  };

  return (
    <div className="app-wrapper">
      {/* Top Header */}
      <header className="app-header">
        <div className="brand-section">
          <div className="brand-icon">
            <Sparkles size={24} />
          </div>
          <div>
            <h1 className="brand-title">Sendora</h1>
            <p className="brand-tagline">AI Email Outreach & Smart Categorization Suite</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="tab-navigation">
          <button
            type="button"
            className={`nav-tab ${activeTab === "categorizer" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("categorizer");
              setStatusMessage(null);
            }}
          >
            <Inbox size={17} />
            AI Email Categorizer & Triage
          </button>
          <button
            type="button"
            className={`nav-tab ${activeTab === "outreach" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("outreach");
              setStatusMessage(null);
            }}
          >
            <Send size={17} />
            Cold Outreach Studio
          </button>
        </div>

        <div className="header-status">
          <span className="status-badge">
            <span className="status-dot"></span>
            Gemini & Nodemailer Active
          </span>
        </div>
      </header>

      {/* Global Banner */}
      {statusMessage && (
        <div className={`banner ${statusMessage.type === "success" ? "banner-success" : "banner-error"}`}>
          {statusMessage.type === "success" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: AI EMAIL CATEGORIZER & TRIAGE */}
      {/* ========================================================================= */}
      {activeTab === "categorizer" && (
        <>
          {/* Quick Metrics Bar */}
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: "rgba(99, 102, 241, 0.15)", color: "#818cf8" }}>
                <Inbox size={22} />
              </div>
              <div className="stat-info">
                <h4>Total Categorized</h4>
                <div className="stat-number">{totalEmails}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: "rgba(220, 38, 38, 0.15)", color: "#f87171" }}>
                <Zap size={22} />
              </div>
              <div className="stat-info">
                <h4>Critical P1 Alerts</h4>
                <div className="stat-number">{criticalP1Count}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#34d399" }}>
                <Calendar size={22} />
              </div>
              <div className="stat-info">
                <h4>Interview Invites</h4>
                <div className="stat-number">{interviewCount}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: "rgba(245, 158, 11, 0.15)", color: "#fbbf24" }}>
                <Clock size={22} />
              </div>
              <div className="stat-info">
                <h4>Action Items Due</h4>
                <div className="stat-number">{actionItemsCount}</div>
              </div>
            </div>
          </div>

          {/* Quick Demo Template Loader */}
          <div className="samples-bar">
            <div className="samples-label">
              <Sparkles size={14} /> Quick Demo Email Samples (Click to autofill):
            </div>
            <div className="samples-chips">
              {DEMO_EMAILS.map((demo, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="sample-chip"
                  onClick={() => handleLoadDemoEmail(demo)}
                >
                  {demo.label}
                </button>
              ))}
            </div>
          </div>

          {/* Categorizer Workspace Grid */}
          <div className="categorizer-grid">
            {/* Left Column: Email Input */}
            <div className="glass-card">
              <h2 className="card-title">
                <div className="card-title-left">
                  <Mail className="card-title-icon" size={22} />
                  1. Inbound Email Ingestion
                </div>
              </h2>

              <form onSubmit={handleCategorizeEmail}>
                <div className="row-2col">
                  <div className="form-group">
                    <label className="form-label">Sender Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Sarah Connor (Google)"
                      value={catSenderName}
                      onChange={(e) => setCatSenderName(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Sender Email</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="e.g. sconnor@google.com"
                      value={catSenderEmail}
                      onChange={(e) => setCatSenderEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email Subject</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Google Technical Screen: Software Engineer"
                    value={catSubject}
                    onChange={(e) => setCatSubject(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Body Content *</label>
                  <textarea
                    className="form-textarea"
                    style={{ minHeight: "180px" }}
                    placeholder="Paste the email received from a recruiter, employer, or platform..."
                    required
                    value={catRawContent}
                    onChange={(e) => setCatRawContent(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn-primary" disabled={isCategorizing}>
                  {isCategorizing ? (
                    <>
                      <Loader2 className="spin" size={20} />
                      Analyzing with AI Engine...
                    </>
                  ) : (
                    <>
                      <Zap size={20} />
                      Analyze & Categorize with AI
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Right Column: AI Breakdown & Smart Reply */}
            <div className="glass-card">
              <h2 className="card-title">
                <div className="card-title-left">
                  <Tag className="card-title-icon" size={22} />
                  2. AI Intelligence & 1-Click Reply
                </div>
              </h2>

              {!currentAnalysis ? (
                <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)" }}>
                  <Inbox size={42} style={{ opacity: 0.3, marginBottom: "12px" }} />
                  <p style={{ fontSize: "0.95rem", fontWeight: 600 }}>No active email analyzed yet.</p>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-subtle)", marginTop: "4px" }}>
                    Select a sample from the top bar or paste an email on the left and click "Analyze".
                  </p>
                </div>
              ) : (
                <div>
                  {/* Analysis Breakdown Panel */}
                  <div className="analysis-panel">
                    <div className="analysis-header">
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <span className={`category-badge ${getCategoryClass(currentAnalysis.category)}`}>
                          {currentAnalysis.category}
                        </span>
                        <span className={`priority-pill ${getPriorityClass(currentAnalysis.priority)}`}>
                          {currentAnalysis.priority} PRIORITY
                        </span>
                      </div>
                      <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: 600 }}>
                        🎯 Confidence: {currentAnalysis.confidenceScore}%
                      </div>
                    </div>

                    <div className="summary-callout">
                      <strong>Summary:</strong> {currentAnalysis.summary}
                    </div>

                    <div className="meta-grid">
                      <div className="meta-item">
                        <div className="meta-title">Action Required</div>
                        <div className="meta-value">{currentAnalysis.actionRequired || "None"}</div>
                      </div>
                      <div className="meta-item">
                        <div className="meta-title">Deadline / Timeframe</div>
                        <div className="meta-value">{currentAnalysis.deadline || "None"}</div>
                      </div>
                    </div>

                    {currentAnalysis.actionRequired && currentAnalysis.actionRequired !== "None" && (
                      <div className="action-callout">
                        ⚠️ <strong>Action Needed:</strong> {currentAnalysis.actionRequired}
                      </div>
                    )}
                  </div>

                  {/* 1-Click AI Smart Reply Card */}
                  <div className="reply-card">
                    <div className="reply-header">
                      <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-main)", display: "flex", alignItems: "center", gap: "6px" }}>
                        <MessageSquare size={16} color="#6366f1" />
                        AI Smart Reply Draft
                      </div>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={handleCopyReply}
                      >
                        {replyCopied ? <CheckCheck size={14} color="#10b981" /> : <Copy size={14} />}
                        {replyCopied ? "Copied!" : "Copy"}
                      </button>
                    </div>

                    <textarea
                      className="form-textarea"
                      style={{ minHeight: "140px", fontSize: "0.88rem" }}
                      value={editedReply}
                      onChange={(e) => setEditedReply(e.target.value)}
                    />

                    <div style={{ marginTop: "12px" }}>
                      <button
                        type="button"
                        className="btn-primary btn-emerald"
                        disabled={isSendingReply || !editedReply.trim() || !catSenderEmail.trim()}
                        onClick={handleSendSmartReply}
                      >
                        {isSendingReply ? (
                          <>
                            <Loader2 className="spin" size={18} />
                            Sending via Nodemailer...
                          </>
                        ) : (
                          <>
                            <Send size={18} />
                            Send Smart Reply to {catSenderEmail || "Sender"}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Triage Inbox & History Section */}
          <section className="glass-card" style={{ marginTop: "10px" }}>
            <div className="card-title">
              <div className="card-title-left">
                <Inbox className="card-title-icon" size={22} />
                Categorized Inbox Triage ({filteredCategorized.length})
              </div>
              <button
                type="button"
                className="btn-secondary"
                onClick={fetchCategorizedList}
              >
                <RefreshCw size={14} /> Refresh
              </button>
            </div>

            {/* Filter Pills & Search */}
            <div className="inbox-controls">
              <div className="filter-pills">
                {[
                  "All",
                  "Interview Invitation",
                  "Job Offer / Assessment",
                  "Recruiter Outreach / Lead",
                  "Action / Follow-Up Needed",
                  "Application Rejection",
                  "Newsletter & General",
                  "Spam / Irrelevant",
                ].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`filter-pill ${selectedCategoryFilter === cat ? "active" : ""}`}
                    onClick={() => setSelectedCategoryFilter(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="search-box">
                <Search className="search-icon-pos" size={15} />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search sender, subject..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {isLoadingCatList ? (
              <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "20px 0", color: "var(--text-muted)" }}>
                <Loader2 className="spin" size={18} /> Loading categorized emails...
              </div>
            ) : filteredCategorized.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", padding: "16px 0" }}>
                No categorized emails found matching your filters. Analyze an email above to add it to your triage inbox!
              </p>
            ) : (
              <div className="logs-table-wrapper">
                <table className="logs-table">
                  <thead>
                    <tr>
                      <th>Sender</th>
                      <th>Subject & Summary</th>
                      <th>Category</th>
                      <th>Priority</th>
                      <th>Action Due</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCategorized.map((item, idx) => (
                      <tr key={item._id || idx}>
                        <td>
                          <div style={{ fontWeight: "700", color: "var(--text-main)" }}>{item.senderName}</div>
                          <div style={{ fontSize: "0.76rem", color: "var(--text-subtle)" }}>{item.senderEmail}</div>
                        </td>
                        <td style={{ maxWidth: "340px" }}>
                          <div style={{ fontWeight: "600", color: "var(--text-main)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {item.subject}
                          </div>
                          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {item.summary}
                          </div>
                        </td>
                        <td>
                          <span className={`category-badge ${getCategoryClass(item.category)}`}>
                            {item.category}
                          </span>
                        </td>
                        <td>
                          <span className={`priority-pill ${getPriorityClass(item.priority)}`}>
                            {item.priority}
                          </span>
                        </td>
                        <td style={{ fontSize: "0.8rem", color: item.deadline !== "None" ? "#fbbf24" : "var(--text-subtle)" }}>
                          {item.deadline || "None"}
                        </td>
                        <td>
                          <select
                            className="form-select"
                            style={{ padding: "4px 8px", fontSize: "0.78rem", width: "auto" }}
                            value={item.status || "Unread"}
                            onChange={(e) => handleUpdateStatus(item._id, e.target.value)}
                          >
                            <option value="Unread">Unread</option>
                            <option value="Read">Read</option>
                            <option value="Replied">Replied</option>
                            <option value="Archived">Archived</option>
                          </select>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button
                              type="button"
                              className="btn-secondary"
                              style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                              title="Load into Editor"
                              onClick={() => {
                                setCurrentAnalysis(item);
                                setEditedReply(item.suggestedReply || "");
                                setCatSenderName(item.senderName);
                                setCatSenderEmail(item.senderEmail);
                                setCatSubject(item.subject);
                                setCatRawContent(item.rawContent);
                                window.scrollTo({ top: 120, behavior: "smooth" });
                              }}
                            >
                              <ArrowRight size={13} />
                            </button>
                            <button
                              type="button"
                              className="btn-secondary"
                              style={{ padding: "4px 8px", fontSize: "0.75rem", color: "#fb7185" }}
                              title="Delete Record"
                              onClick={() => handleDeleteCategorized(item._id)}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: COLD OUTREACH STUDIO */}
      {/* ========================================================================= */}
      {activeTab === "outreach" && (
        <>
          <div className="main-grid">
            {/* Left Column: Job Description & Details */}
            <div className="glass-card">
              <h2 className="card-title">
                <div className="card-title-left">
                  <Briefcase className="card-title-icon" size={22} />
                  1. Outreach Details & Requirements
                </div>
              </h2>

              <form onSubmit={handleGenerateEmail}>
                <div className="row-2col">
                  <div className="form-group">
                    <label className="form-label">Recipient Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Sarah Connor / Hiring Manager"
                      value={recruiterName}
                      onChange={(e) => setRecruiterName(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Recipient Email *</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="e.g. recruiter@company.com"
                      required
                      value={recruiterEmail}
                      onChange={(e) => setRecruiterEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Job Requirement / Description *</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Paste the job description, required skills, or key responsibilities here..."
                    required
                    value={jobRequirement}
                    onChange={(e) => setJobRequirement(e.target.value)}
                  />
                </div>

                {/* Regards & Social Links Drawer */}
                <div className="profile-panel">
                  <div className="profile-panel-header" onClick={() => setShowProfileDrawer(!showProfileDrawer)}>
                    <span className="profile-panel-title">
                      <ShieldCheck size={16} />
                      Sender Regards Profiles (Appended to Email)
                    </span>
                    {showProfileDrawer ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>

                  {showProfileDrawer && (
                    <div className="profile-grid">
                      <div>
                        <label className="form-label">Your Full Name</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Your full name"
                          value={senderName}
                          onChange={(e) => setSenderName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="form-label">LinkedIn Profile URL</label>
                        <input
                          type="url"
                          className="form-input"
                          placeholder="https://linkedin.com/in/your-profile"
                          value={linkedin}
                          onChange={(e) => setLinkedin(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="form-label">Resume Link / URL</label>
                        <input
                          type="url"
                          className="form-input"
                          placeholder="https://your-resume-link"
                          value={resumeLink}
                          onChange={(e) => setResumeLink(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="form-label">GitHub Profile URL</label>
                        <input
                          type="url"
                          className="form-input"
                          placeholder="https://github.com/your-username"
                          value={github}
                          onChange={(e) => setGithub(e.target.value)}
                        />
                      </div>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <label className="form-label">LeetCode Profile URL</label>
                        <input
                          type="url"
                          className="form-input"
                          placeholder="https://leetcode.com/your-username"
                          value={leetcode}
                          onChange={(e) => setLeetcode(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <button type="submit" className="btn-primary" disabled={isGenerating}>
                  {isGenerating ? (
                    <>
                      <Loader2 className="spin" size={20} />
                      Framing Email with AI...
                    </>
                  ) : (
                    <>
                      <Sparkles size={20} />
                      Generate AI Email
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Right Column: AI Output & Nodemailer Dispatcher */}
            <div className="glass-card">
              <h2 className="card-title">
                <div className="card-title-left">
                  <Mail className="card-title-icon" size={22} />
                  2. Email Preview & Nodemailer Dispatch
                </div>
              </h2>

              <form onSubmit={handleSendEmail}>
                <div className="form-group">
                  <label className="form-label">Email Subject</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Subject will be generated by AI or typed here..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Body</label>
                  <textarea
                    className="form-textarea"
                    style={{ minHeight: "180px" }}
                    placeholder="AI generated email body will appear here. You can edit it before sending."
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                  />
                </div>

                {/* Regards Signature Preview */}
                <div className="regards-preview-box">
                  <div className="regards-preview-title">
                    <CheckCircle2 size={14} /> Attached Regards Signature (Auto-appended by Nodemailer):
                  </div>
                  <p style={{ fontSize: "0.85rem", color: "#e2e8f0", marginBottom: "8px" }}>
                    Best regards,
                    <br />
                    <strong>{senderName}</strong>
                  </p>
                  <div className="regards-preview-links">
                    <div className="link-chip">
                      <LinkedinIcon size={14} color="#0077b5" />
                      <a href={linkedin} target="_blank" rel="noreferrer">LinkedIn Profile</a>
                    </div>
                    <div className="link-chip">
                      <FileText size={14} color="#10b981" />
                      <a href={resumeLink} target="_blank" rel="noreferrer">Resume</a>
                    </div>
                    <div className="link-chip">
                      <GithubIcon size={14} color="#a5b4fc" />
                      <a href={github} target="_blank" rel="noreferrer">GitHub Profile</a>
                    </div>
                    <div className="link-chip">
                      <Code size={14} color="#f59e0b" />
                      <a href={leetcode} target="_blank" rel="noreferrer">LeetCode Profile</a>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: "18px" }}>
                  <button
                    type="submit"
                    className="btn-primary btn-emerald"
                    disabled={isSending || !subject.trim() || !body.trim()}
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="spin" size={20} />
                        Sending via Nodemailer...
                      </>
                    ) : (
                      <>
                        <Send size={20} />
                        Send Email via Nodemailer
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Outreach History Section */}
          <section className="glass-card" style={{ marginTop: "10px" }}>
            <div className="card-title">
              <div className="card-title-left">
                <Clock className="card-title-icon" size={22} />
                Sent Outreach History ({outreachLogs.length})
              </div>
              <button
                type="button"
                className="btn-secondary"
                onClick={fetchOutreachLogs}
              >
                <RefreshCw size={14} /> Refresh
              </button>
            </div>

            {isLoadingOutreachLogs ? (
              <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "20px 0", color: "var(--text-muted)" }}>
                <Loader2 className="spin" size={18} /> Loading history...
              </div>
            ) : outreachLogs.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", padding: "16px 0" }}>
                No outreach emails sent yet. Generate and send an outreach email above to track it here!
              </p>
            ) : (
              <div className="logs-table-wrapper">
                <table className="logs-table">
                  <thead>
                    <tr>
                      <th>Recipient</th>
                      <th>Email</th>
                      <th>Subject</th>
                      <th>Status</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {outreachLogs.map((log, idx) => (
                      <tr key={log._id || idx}>
                        <td style={{ fontWeight: "700", color: "var(--text-main)" }}>
                          {log.recruiterName || "Hiring Manager"}
                        </td>
                        <td>{log.recruiterEmail}</td>
                        <td style={{ maxWidth: "340px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {log.subject}
                        </td>
                        <td>
                          <span className={`badge-status ${log.status === "Success" ? "badge-success" : "badge-failed"}`}>
                            {log.status}
                          </span>
                        </td>
                        <td style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                          {log.sentAt ? new Date(log.sentAt).toLocaleString() : "Just now"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
