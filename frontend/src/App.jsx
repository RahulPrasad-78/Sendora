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
  RefreshCw,
  Paperclip,
  Eye,
  Database,
  BookOpen,
} from "lucide-react";
import ResumeBuilder from "./components/ResumeBuilder";
import KnowledgeBaseManager from "./components/KnowledgeBaseManager";

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

export default function App() {
  // Navigation State: 'outreach' (Send Mail) | 'resumes' (AI Resume Builder) | 'categorizer' (Email Triage)
  const [activeTab, setActiveTab] = useState("outreach");

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

  // --- RESUME ATTACHMENT & MONGODB RESUME STATE ---
  const [savedResumes, setSavedResumes] = useState([]);
  const [attachResume, setAttachResume] = useState(true);
  const [resumeMode, setResumeMode] = useState("new"); // 'new' | 'existing'
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [generatedNewResume, setGeneratedNewResume] = useState(null);
  const [isBuildingOutreachResume, setIsBuildingOutreachResume] = useState(false);

  // --- OWNER AUTHENTICATION & ACCESS CONTROL STATE ---
  const [isOwner, setIsOwner] = useState(false);
  const [ownerToken, setOwnerToken] = useState(() => localStorage.getItem("sendora_owner_token") || "");
  const [isOwnerModalOpen, setIsOwnerModalOpen] = useState(false);
  const [ownerPasscodeInput, setOwnerPasscodeInput] = useState("");
  const [ownerAuthError, setOwnerAuthError] = useState("");
  const [isCheckingPasscode, setIsCheckingPasscode] = useState(false);

  // Restricted Action Modal State (Triggered when non-owner clicks a locked action)
  const [restrictedModal, setRestrictedModal] = useState({
    isOpen: false,
    featureName: "",
    description: "",
  });

  const triggerRestrictedAlert = (featureName, description) => {
    setRestrictedModal({
      isOpen: true,
      featureName: featureName || "Owner-Only Feature",
      description: description || "This action is restricted in Viewer Mode. Recruiters and guests can test all AI prompts and previews freely, while real dispatch and database updates remain securely locked for the portfolio owner.",
    });
  };

  // Shared UI Banner
  const [statusMessage, setStatusMessage] = useState(null);
  const [backendDown, setBackendDown] = useState(false);

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

  // Fetch Saved Resumes from MongoDB
  const fetchSavedResumes = async () => {
    try {
      const res = await fetch("/api/resumes");
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        setSavedResumes(list);
        if (list.length > 0 && !selectedResumeId) {
          setSelectedResumeId(list[0]._id);
        }
      }
    } catch (err) {
      console.warn("Could not fetch saved resumes:", err);
    }
  };

  useEffect(() => {
    // Check backend health first — show warning if server is not running
    fetch("/api/health")
      .then((r) => { if (!r.ok) throw new Error("not ok"); setBackendDown(false); })
      .catch(() => setBackendDown(true));

    fetchOutreachLogs();
    fetchSavedResumes();
    checkOwnerAuth(ownerToken);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkOwnerAuth = async (token) => {
    if (!token) {
      setIsOwner(false);
      return;
    }
    try {
      const res = await fetch("/api/auth/status", {
        headers: { "x-owner-key": token },
      });
      if (res.ok) {
        const data = await res.json();
        setIsOwner(Boolean(data.isOwner));
      } else {
        setIsOwner(false);
      }
    } catch {
      setIsOwner(false);
    }
  };

  const handleVerifyOwner = async (e) => {
    e.preventDefault();
    if (!ownerPasscodeInput.trim()) return;

    setIsCheckingPasscode(true);
    setOwnerAuthError("");

    try {
      const res = await fetch("/api/auth/verify-owner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode: ownerPasscodeInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Invalid passcode.");
      }

      const token = data.token;
      setOwnerToken(token);
      localStorage.setItem("sendora_owner_token", token);
      setIsOwner(true);
      setIsOwnerModalOpen(false);
      setOwnerPasscodeInput("");
      setStatusMessage({
        type: "success",
        text: "👑 Owner Mode activated! Nodemailer email dispatch and MongoDB knowledge updates are now unlocked.",
      });
    } catch (err) {
      setOwnerAuthError(err.message);
    } finally {
      setIsCheckingPasscode(false);
    }
  };

  const handleOwnerLogout = () => {
    localStorage.removeItem("sendora_owner_token");
    setOwnerToken("");
    setIsOwner(false);
    setStatusMessage({
      type: "success",
      text: "🔒 Switched to Viewer Mode. Sensitive dispatch and database actions locked.",
    });
  };

  // Build tailored resume immediately inside Outreach
  const handleBuildOutreachResumeNow = async () => {
    if (!jobRequirement.trim()) {
      setStatusMessage({ type: "error", text: "Please paste the Job Requirement description first." });
      return;
    }

    setIsBuildingOutreachResume(true);
    try {
      const res = await fetch("/api/resumes/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(ownerToken ? { "x-owner-key": ownerToken } : {}),
        },
        body: JSON.stringify({ jobDescription: jobRequirement }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Failed to generate tailored resume");

      setGeneratedNewResume(data.data);
      if (data.isQuotaExceeded || data.aiErrorMessage) {
        setStatusMessage({
          type: "warning",
          text: `⚠️ ${data.aiErrorMessage || "Google Gemini API daily quota exceeded! Compiled and attached master base resume fallback."}`,
        });
      } else {
        setStatusMessage({
          type: "success",
          text: `✨ Tailored resume "${data.data.title}" compiled and attached for this email!`,
        });
      }
      fetchSavedResumes();
    } catch (err) {
      setStatusMessage({ type: "error", text: `Error tailoring resume: ${err.message}` });
    } finally {
      setIsBuildingOutreachResume(false);
    }
  };

  // Switch from ResumeBuilder to Outreach with a resume selected
  const handleApplyResumeFromBuilder = (resume) => {
    setActiveTab("outreach");
    setAttachResume(true);
    setResumeMode("existing");
    setSelectedResumeId(resume._id);
    if (!jobRequirement.trim() && resume.jobDescription) {
      setJobRequirement(resume.jobDescription);
    }
    setStatusMessage({
      type: "success",
      text: `📎 Attached "${resume.title}" from MongoDB to your outreach email!`,
    });
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

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
      if (data.isQuotaExceeded || data.aiErrorMessage) {
        setStatusMessage({
          type: "warning",
          text: `⚠️ ${data.aiErrorMessage || "Google Gemini API daily quota limit exceeded! Loaded default email fallback."}`,
        });
      } else {
        setStatusMessage({
          type: "success",
          text: '✨ AI framed your email successfully! Review and click "Send Email via Nodemailer".',
        });
      }
    } catch (err) {
      setStatusMessage({ type: "error", text: `Generation error: ${err.message}` });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();

    // Intercept if in Viewer Mode
    if (!isOwner) {
      triggerRestrictedAlert(
        "Send Email via Nodemailer",
        "Direct SMTP email dispatch via Nodemailer is disabled in Viewer Mode to protect the author's Gmail credentials and quota. You can still generate personalized AI emails, review subject lines, and preview the full message body."
      );
      return;
    }

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
        headers: {
          "Content-Type": "application/json",
          "x-owner-key": ownerToken,
        },
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
          attachResume,
          resumeMode,
          selectedResumeId: resumeMode === "existing" ? selectedResumeId : null,
          newResumeData: resumeMode === "new" ? generatedNewResume : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send email");

      setStatusMessage({
        type: "success",
        text: `🚀 ${data.message} to ${recruiterEmail}!`,
      });
      fetchOutreachLogs();
      fetchSavedResumes();
    } catch (err) {
      setStatusMessage({ type: "error", text: `Dispatch error: ${err.message}` });
    } finally {
      setIsSending(false);
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
            <p className="brand-tagline">Cold Email Outreach &amp; ATS Resume Engine</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="tab-navigation">
          <button
            type="button"
            className={`nav-tab ${activeTab === "outreach" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("outreach");
              setStatusMessage(null);
            }}
          >
            <Send size={15} />
            <span>Send Mail &amp; Outreach</span>
          </button>
          <button
            type="button"
            className={`nav-tab ${activeTab === "resumes" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("resumes");
              setStatusMessage(null);
            }}
          >
            <FileText size={15} />
            <span>AI Resume Builder</span>
          </button>
          <button
            type="button"
            className={`nav-tab ${activeTab === "knowledge" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("knowledge");
              setStatusMessage(null);
            }}
          >
            <Database size={15} />
            <span>Knowledge Base</span>
          </button>
          <button
            type="button"
            className={`nav-tab nav-tab-with-sub ${activeTab === "categorizer" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("categorizer");
              setStatusMessage(null);
            }}
          >
            <Inbox size={15} />
            <span className="tab-text-group">
              <span className="tab-main-label">Email Categorizer</span>
              <span className="tab-sub-badge">Coming Soon</span>
            </span>
          </button>
        </div>

        <div className="header-status">
          {/* Owner Mode Toggle Button */}
          {isOwner ? (
            <button
              type="button"
              className="owner-badge-btn owner-badge-active"
              onClick={handleOwnerLogout}
              title="Click to lock and switch back to Viewer Mode"
            >
              <ShieldCheck size={14} />
              <span>Owner Mode: Active</span>
              <span style={{ fontSize: "0.7rem", opacity: 0.8 }}>(Lock)</span>
            </button>
          ) : (
            <button
              type="button"
              className="owner-badge-btn owner-badge-guest"
              onClick={() => {
                setOwnerAuthError("");
                setIsOwnerModalOpen(true);
              }}
              title="Click to enter Owner Passcode and unlock email dispatch & database editing"
            >
              <span>🔒 Viewer Mode</span>
              <span style={{ fontSize: "0.72rem", textDecoration: "underline", opacity: 0.9 }}>Owner Login</span>
            </button>
          )}

          <span className="status-badge">
            <span className="status-dot"></span>
            System Ready
          </span>
        </div>
      </header>

      {/* Global Banner */}
      {statusMessage && (
        <div className={`banner ${statusMessage.type === "success" ? "banner-success" : statusMessage.type === "warning" ? "banner-warning" : "banner-error"}`}>
          {statusMessage.type === "success" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Backend Down Warning */}
      {backendDown && (
        <div className="banner banner-error" style={{ justifyContent: "center", fontWeight: 600, fontSize: "0.95rem" }}>
          <AlertCircle size={20} />
          <span>
            ⚠️ Backend server is not running.&nbsp;
            Open a terminal in the <strong>Sendora</strong> root folder and run:&nbsp;
            <code style={{ background: "#18181B", color: "#FAF8F5", padding: "2px 8px", borderRadius: "4px", fontFamily: "monospace" }}>npm run dev</code>
          </span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: EMAIL CATEGORIZER — COMING SOON                                    */}
      {/* ========================================================================= */}
      {activeTab === "categorizer" && (
        <div className="classic-coming-soon-container">
          <div className="classic-coming-soon-card">
            <span className="coming-soon-eyebrow">Future Work</span>
            <h2 className="coming-soon-heading">Email Categorizer &amp; Smart Triage</h2>
            <p className="coming-soon-text">
              Inbound recruiter message classification, priority scheduling (P1 to P5), assessment deadline extraction, and automated one-click polite response drafting are currently in development for a future release.
            </p>

            <div className="coming-soon-features-grid">
              <div className="coming-soon-feature-item">
                <div className="feature-item-num">01</div>
                <div className="feature-item-title">Priority Triage</div>
                <div className="feature-item-desc">
                  Classifies inbound messages from interview invites to offers with urgency scoring.
                </div>
              </div>
              <div className="coming-soon-feature-item">
                <div className="feature-item-num">02</div>
                <div className="feature-item-title">Deadline Extractor</div>
                <div className="feature-item-desc">
                  Detects assessment deadlines and virtual interview scheduling calendar links.
                </div>
              </div>
              <div className="coming-soon-feature-item">
                <div className="feature-item-num">03</div>
                <div className="feature-item-title">Polite Smart Replies</div>
                <div className="feature-item-desc">
                  Drafts context-aware professional responses and calendar confirmations in one click.
                </div>
              </div>
            </div>

            <div style={{ marginTop: "32px" }}>
              <button
                type="button"
                className="btn-primary"
                style={{ maxWidth: "300px", margin: "0 auto" }}
                onClick={() => setActiveTab("outreach")}
              >
                <Send size={15} />
                Return to Send Mail &amp; Outreach
              </button>
            </div>
          </div>
        </div>
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

                {/* Resume Attachment Option */}
                <div className="resume-attach-panel">
                  <label className="resume-checkbox-label">
                    <input
                      type="checkbox"
                      className="resume-checkbox"
                      checked={attachResume}
                      onChange={(e) => setAttachResume(e.target.checked)}
                    />
                    <Paperclip size={18} color="var(--primary)" />
                    Attach Tailored Resume to Email (PDF)
                  </label>

                  {attachResume && (
                    <div className="resume-mode-selector">
                      <div className="radio-row">
                        <label
                          className={`radio-option ${resumeMode === "new" ? "selected" : ""}`}
                          onClick={() => setResumeMode("new")}
                        >
                          <input
                            type="radio"
                            name="resumeMode"
                            checked={resumeMode === "new"}
                            onChange={() => setResumeMode("new")}
                          />
                          <span>⚡ Build New Resume for this JD</span>
                        </label>
                        <label
                          className={`radio-option ${resumeMode === "existing" ? "selected" : ""}`}
                          onClick={() => setResumeMode("existing")}
                        >
                          <input
                            type="radio"
                            name="resumeMode"
                            checked={resumeMode === "existing"}
                            onChange={() => setResumeMode("existing")}
                          />
                          <span>📂 Select Existing from MongoDB ({savedResumes.length})</span>
                        </label>
                      </div>

                      {resumeMode === "new" && (
                        <div className="resume-mode-subpanel">
                          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "8px" }}>
                            Gemini AI analyzes this JD, tailors matching projects from your knowledge base, compiles with XeLaTeX, saves to MongoDB, and attaches the PDF.
                          </p>
                          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                            <button
                              type="button"
                              className="btn-secondary"
                              style={{ fontSize: "0.8rem", padding: "6px 12px" }}
                              disabled={isBuildingOutreachResume || !jobRequirement.trim()}
                              onClick={handleBuildOutreachResumeNow}
                            >
                              {isBuildingOutreachResume ? (
                                <>
                                  <Loader2 className="spin" size={14} /> Building XeLaTeX Resume...
                                </>
                              ) : (
                                <>
                                  <FileText size={14} /> Preview &amp; Build Resume Now
                                </>
                              )}
                            </button>
                            {generatedNewResume && (
                              <span style={{ fontSize: "0.8rem", color: "var(--accent-green)", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
                                <CheckCircle2 size={15} /> Ready: "{generatedNewResume.title}"
                                {generatedNewResume._id && !generatedNewResume._id.startsWith("mem_") && (
                                  <a
                                    href={`/api/resumes/${generatedNewResume._id}/pdf`}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{ color: "var(--text-main)", fontWeight: "700", textDecoration: "underline", marginLeft: "4px" }}
                                  >
                                    View PDF
                                  </a>
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {resumeMode === "existing" && (
                        <div className="resume-mode-subpanel">
                          {savedResumes.length === 0 ? (
                            <p style={{ fontSize: "0.82rem", color: "var(--accent-gold)" }}>
                              ⚠️ No saved resumes found in MongoDB. You can generate a new one with "Build New Resume" or use the Resume Builder tab.
                            </p>
                          ) : (
                            <div>
                              <label className="form-label" style={{ fontSize: "0.78rem" }}>
                                Select Saved Resume from MongoDB:
                              </label>
                              <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                                <select
                                  className="form-select"
                                  style={{ flex: 1, minWidth: "220px" }}
                                  value={selectedResumeId}
                                  onChange={(e) => setSelectedResumeId(e.target.value)}
                                >
                                  {savedResumes.map((r) => (
                                    <option key={r._id} value={r._id}>
                                      {r.title} ({r.targetRole || "Software Engineer"}{r.company ? ` · ${r.company}` : ""})
                                    </option>
                                  ))}
                                </select>
                                {selectedResumeId && (
                                  <a
                                    href={`/api/resumes/${selectedResumeId}/pdf`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn-secondary"
                                    style={{ textDecoration: "none", fontSize: "0.8rem", padding: "8px 12px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                                  >
                                    <Eye size={14} /> View PDF
                                  </a>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
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
                  <p style={{ fontSize: "0.85rem", color: "var(--text-main)", marginBottom: "8px" }}>
                    Best regards,
                    <br />
                    <strong>{senderName}</strong>
                  </p>
                  <div className="regards-preview-links">
                    <div className="link-chip">
                      <LinkedinIcon size={14} color="#18181B" />
                      <a href={linkedin} target="_blank" rel="noreferrer">LinkedIn Profile</a>
                    </div>
                    <div className="link-chip">
                      <FileText size={14} color="#18181B" />
                      <a href={resumeLink} target="_blank" rel="noreferrer">Resume</a>
                    </div>
                    <div className="link-chip">
                      <GithubIcon size={14} color="#18181B" />
                      <a href={github} target="_blank" rel="noreferrer">GitHub Profile</a>
                    </div>
                    <div className="link-chip">
                      <Code size={14} color="#18181B" />
                      <a href={leetcode} target="_blank" rel="noreferrer">LeetCode Profile</a>
                    </div>
                  </div>

                  {attachResume && (
                    <div style={{ marginTop: "12px", padding: "8px 12px", background: "#F4EFE6", border: "1px solid var(--border-color)", borderRadius: "6px", fontSize: "0.82rem", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "8px" }}>
                      <Paperclip size={14} color="var(--text-main)" />
                      <span>
                        <strong>PDF Resume Attached:</strong>{" "}
                        {resumeMode === "existing"
                          ? (savedResumes.find((r) => r._id === selectedResumeId)?.title || "Selected Resume from MongoDB (PDF)")
                          : (generatedNewResume ? generatedNewResume.title : "Auto-tailored for this JD (PDF)")}
                      </span>
                    </div>
                  )}
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
                        {!isOwner && <span className="btn-restricted-tag">🔒 Owner Only</span>}
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
                      <th>Resume Attached</th>
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
                          {log.attachedResumeTitle ? (
                            <span className="project-tag" style={{ fontSize: "0.72rem" }}>
                              📎 {log.attachedResumeTitle}
                            </span>
                          ) : (
                            <span style={{ color: "var(--text-subtle)", fontSize: "0.76rem" }}>None</span>
                          )}
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

      {/* ========================================================================= */}
      {/* TAB 2: AI RESUME BUILDER & MONGODB STORAGE */}
      {/* ========================================================================= */}
      {activeTab === "resumes" && (
        <ResumeBuilder
          savedResumes={savedResumes}
          onRefreshResumes={fetchSavedResumes}
          onApplyInSendMail={handleApplyResumeFromBuilder}
          setStatusMessage={setStatusMessage}
          isOwner={isOwner}
          ownerToken={ownerToken}
          triggerRestrictedAlert={triggerRestrictedAlert}
        />
      )}

      {/* ========================================================================= */}
      {/* TAB 3: DYNAMIC KNOWLEDGE BASE (PROJECT READMES & MASTER RESUME) */}
      {/* ========================================================================= */}
      {activeTab === "knowledge" && (
        <KnowledgeBaseManager
          isOwner={isOwner}
          ownerToken={ownerToken}
          triggerRestrictedAlert={triggerRestrictedAlert}
        />
      )}

      {/* ========================================================================= */}
      {/* GLOBAL FOOTER WITH ABOUT & SYSTEM OVERVIEW LINK                          */}
      {/* ========================================================================= */}
      <footer className="app-footer">
        <div className="footer-left">
          <Sparkles size={20} color="var(--accent-gold)" />
          <div>
            <span className="footer-brand">Sendora</span>
            <span className="footer-desc"> — Automated Cold Outreach &amp; Tailored ATS Resume Platform</span>
          </div>
        </div>
        <div className="footer-right">
          <a
            href="/sendora-overview.html"
            target="_blank"
            rel="noreferrer"
            className="about-artifact-link"
            title="Read Complete Platform Architecture, Flowcharts & Deployment Guide"
          >
            <BookOpen size={15} />
            <span>About Project &amp; Architecture Flowcharts</span>
          </a>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* COLORFUL RESTRICTED ACTION ALERT MODAL                                    */}
      {/* ========================================================================= */}
      {restrictedModal.isOpen && (
        <div className="restricted-overlay" onClick={() => setRestrictedModal({ isOpen: false, featureName: "", description: "" })}>
          <div className="restricted-card" onClick={(e) => e.stopPropagation()}>
            <div className="restricted-header">
              <div className="restricted-icon-box">
                <AlertCircle size={24} />
              </div>
              <div className="restricted-title-wrap">
                <span className="restricted-subtitle">Portfolio Viewer Mode</span>
                <h3>Action Reserved for Project Owner</h3>
              </div>
            </div>
            <div className="restricted-body">
              <p>{restrictedModal.description}</p>
              <div className="restricted-feature-box">
                🔒 <strong>Restricted:</strong> {restrictedModal.featureName}
              </div>
              <p style={{ marginTop: "12px", fontSize: "0.85rem", color: "var(--text-subtle)" }}>
                You are currently browsing the live deployment in <strong>Viewer Mode</strong>. Feel free to explore all AI prompts, generated resumes, and architecture diagrams!
              </p>
            </div>
            <div className="restricted-footer">
              <button
                type="button"
                className="restricted-dismiss-btn"
                onClick={() => setRestrictedModal({ isOpen: false, featureName: "", description: "" })}
              >
                Close
              </button>
              <a
                href="/sendora-overview.html"
                target="_blank"
                rel="noreferrer"
                className="restricted-about-btn"
                onClick={() => setRestrictedModal({ isOpen: false, featureName: "", description: "" })}
              >
                <BookOpen size={16} />
                <span>Learn How Sendora Works</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* OWNER PASSCODE VERIFICATION MODAL                                        */}
      {/* ========================================================================= */}
      {isOwnerModalOpen && (
        <div className="restricted-overlay" onClick={() => setIsOwnerModalOpen(false)}>
          <div className="restricted-card owner-login-card" onClick={(e) => e.stopPropagation()}>
            <div className="restricted-header">
              <div className="restricted-icon-box" style={{ background: "#EEF2FF", borderColor: "#C7D2FE", color: "#4338CA" }}>
                <ShieldCheck size={24} />
              </div>
              <div className="restricted-title-wrap">
                <span className="restricted-subtitle" style={{ color: "#4338CA" }}>Owner Authentication</span>
                <h3>Unlock Full Platform Access</h3>
              </div>
            </div>
            <form onSubmit={handleVerifyOwner}>
              <div className="restricted-body">
                <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginBottom: "10px" }}>
                  Enter your owner secret passcode to enable live Nodemailer dispatching and MongoDB database modifications.
                </p>
                <label className="form-label" style={{ fontSize: "0.82rem" }}>Owner Passcode</label>
                <input
                  type="password"
                  className="owner-login-input"
                  placeholder="Enter passcode..."
                  value={ownerPasscodeInput}
                  onChange={(e) => setOwnerPasscodeInput(e.target.value)}
                  autoFocus
                />
                {ownerAuthError && (
                  <div style={{ marginTop: "8px", fontSize: "0.82rem", color: "var(--accent-crimson)", display: "flex", alignItems: "center", gap: "5px" }}>
                    <AlertCircle size={14} />
                    <span>{ownerAuthError}</span>
                  </div>
                )}
              </div>
              <div className="restricted-footer">
                <button
                  type="button"
                  className="restricted-dismiss-btn"
                  onClick={() => setIsOwnerModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="restricted-about-btn"
                  disabled={isCheckingPasscode || !ownerPasscodeInput.trim()}
                >
                  {isCheckingPasscode ? "Verifying..." : "Unlock Access"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
