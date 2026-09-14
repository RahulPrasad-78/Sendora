import React, { useState, useEffect } from "react";
import {
  FileText,
  Sparkles,
  Download,
  Eye,
  Send,
  Trash2,
  Copy,
  Check,
  AlertCircle,
  Loader2,
  RefreshCw,
  Search,
  BookOpen,
  Code,
  Layers,
  Cpu,
  RotateCcw,
  Save,
} from "lucide-react";

// Realistic Presets for Quick Testing
const DEMO_JDS = [
  {
    label: "🛒 Full Stack Engineer (MERN + Payments)",
    role: "Full Stack Software Engineer",
    company: "Shopify",
    text: "Shopify is seeking a Full Stack Software Engineer to build scalable commerce solutions. We require strong experience with React, Node.js, Express, REST APIs, and MongoDB. Experience with payment gateway integrations (Razorpay / Stripe), state management with Redux, and cloud deployments is highly desired. The candidate should be comfortable architecting RESTful services and optimizing UI performance.",
  },
  {
    label: "☁️ .NET & Cloud Microservices Engineer",
    role: "Backend .NET Core Engineer",
    company: "Microsoft Partner / Capgemini",
    text: "Looking for an energetic .NET Software Engineer with experience in ASP.NET Core, .NET 8, C#, and Microservices architecture. Key duties include building RESTful Web APIs, implementing JWT authentication, utilizing Entity Framework Core and SQL Server, and configuring API Gateways (YARP). Familiarity with Microsoft Azure (App Service, Azure SQL, DevOps CI/CD) and distributed logging using Serilog is strongly preferred.",
  },
  {
    label: "⚡ Backend Systems Engineer (Node.js & Distributed)",
    role: "Software Development Engineer II",
    company: "Amazon AWS",
    text: "AWS Developer Tools team is hiring an SDE II. You will architect high-throughput backend services using Node.js, TypeScript, and MongoDB. Responsibilities include designing secure REST APIs, role-based authorization, automated email/notification workflows with Nodemailer, and microservices resilience. Strong fundamentals in Data Structures, Algorithms, and System Design are required.",
  },
];

const STAGES = {
  IDLE: "idle",
  READING: "reading",
  ANALYZING: "analyzing",
  COMPILING: "compiling",
  SAVING: "saving",
  DONE: "done",
  ERROR: "error",
};

export default function ResumeBuilder({
  savedResumes,
  onRefreshResumes,
  onApplyInSendMail,
  setStatusMessage,
  isOwner = false,
  ownerToken = "",
  triggerRestrictedAlert,
}) {
  const [jobDescription, setJobDescription] = useState("");
  const [projectCount, setProjectCount] = useState(2);
  const [stage, setStage] = useState(STAGES.IDLE);
  const [error, setError] = useState(null);
  const [quotaNotice, setQuotaNotice] = useState(null);
  const [currentResume, setCurrentResume] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [previewMode, setPreviewMode] = useState("pdf"); // 'pdf' | 'latex'
  const [editableLatex, setEditableLatex] = useState("");
  const [isRecompiling, setIsRecompiling] = useState(false);
  const [copiedLatex, setCopiedLatex] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [kbStatus, setKbStatus] = useState(null);

  // Fetch Knowledge Base & XeLaTeX Status
  useEffect(() => {
    let isMounted = true;
    async function checkStatus() {
      try {
        const res = await fetch("/api/resumes/status");
        if (res.ok && isMounted) {
          const data = await res.json();
          setKbStatus(data);
        }
      } catch (err) {
        console.warn("Could not fetch KB status:", err);
      }
    }
    checkStatus();
    return () => { isMounted = false; };
  }, []);

  // Handle Generating Tailored Resume
  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    if (!jobDescription.trim()) {
      setError("Please paste or select a Job Description first.");
      return;
    }

    setError(null);
    setStage(STAGES.READING);

    const t1 = setTimeout(() => setStage(STAGES.ANALYZING), 800);
    const t2 = setTimeout(() => setStage(STAGES.COMPILING), 2800);
    const t3 = setTimeout(() => setStage(STAGES.SAVING), 5000);

    try {
      const res = await fetch("/api/resumes/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(ownerToken ? { "x-owner-key": ownerToken } : {}),
        },
        body: JSON.stringify({ jobDescription, projectCount }),
      });

      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Failed to generate resume");

      const resumeData = data.data;
      setCurrentResume(resumeData);
      setEditableLatex(resumeData.latexContent || "");
      setPreviewMode("pdf");

      if (resumeData.pdfBase64) {
        const byteCharacters = atob(resumeData.pdfBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/pdf" });
        if (pdfUrl) URL.revokeObjectURL(pdfUrl);
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      }

      setStage(STAGES.DONE);
      if (data.isQuotaExceeded || data.aiErrorMessage) {
        setQuotaNotice(data.aiErrorMessage || "Google Gemini API daily quota limit reached (429)! The resume was compiled safely using your master base template.");
        setStatusMessage({
          type: "warning",
          text: `⚠️ ${data.aiErrorMessage || "Google Gemini API daily quota exceeded! Compiled from base master resume."}`,
        });
      } else {
        setQuotaNotice(null);
        setStatusMessage({
          type: "success",
          text: `✨ Tailored resume "${resumeData.title}" compiled and saved to MongoDB!`,
        });
      }
      if (onRefreshResumes) onRefreshResumes();
    } catch (err) {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      setError(err.message);
      setStage(STAGES.ERROR);
      setStatusMessage({ type: "error", text: `Resume Builder error: ${err.message}` });
    }
  };

  // Download PDF
  const handleDownloadPdf = () => {
    if (pdfUrl && currentResume) {
      const a = document.createElement("a");
      a.href = pdfUrl;
      a.download = currentResume.pdfFileName || "Tailored_Resume.pdf";
      a.click();
    }
  };

  // Copy LaTeX
  const handleCopyLatex = () => {
    const codeToCopy = editableLatex || currentResume?.latexContent || "";
    if (!codeToCopy) return;
    navigator.clipboard.writeText(codeToCopy);
    setCopiedLatex(true);
    setTimeout(() => setCopiedLatex(false), 2000);
  };

  // Recompile Edited LaTeX via XeLaTeX & Save to MongoDB
  const handleRecompileAndSave = async () => {
    if (!isOwner) {
      if (triggerRestrictedAlert) {
        triggerRestrictedAlert(
          "Edit LaTeX & Recompile to MongoDB",
          "Editing master LaTeX source and recompiling with MongoDB persistence is restricted to the authenticated project owner. Guests can review the LaTeX source code and copy it to their clipboard."
        );
      }
      return;
    }

    if (!editableLatex.trim()) {
      setStatusMessage({ type: "error", text: "LaTeX code cannot be empty." });
      return;
    }

    setIsRecompiling(true);
    try {
      const resumeId = currentResume?._id || "draft";
      const res = await fetch(`/api/resumes/${resumeId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-owner-key": ownerToken,
        },
        body: JSON.stringify({
          latexContent: editableLatex,
          title: currentResume?.title || "Custom Tailored Resume",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Failed to recompile LaTeX");

      const updated = data.data;
      setCurrentResume(updated);
      setEditableLatex(updated.latexContent || editableLatex);

      if (updated.pdfBase64) {
        const byteCharacters = atob(updated.pdfBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/pdf" });
        if (pdfUrl) URL.revokeObjectURL(pdfUrl);
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      }

      setPreviewMode("pdf");
      setStatusMessage({
        type: "success",
        text: "✨ LaTeX recompiled via XeLaTeX and updated in MongoDB Atlas!",
      });
      if (onRefreshResumes) onRefreshResumes();
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: `Recompile failed: ${err.message}`,
      });
    } finally {
      setIsRecompiling(false);
    }
  };

  // Preview Saved Resume from List
  const handleSelectSavedResume = async (item, targetMode = "pdf") => {
    try {
      const res = await fetch(`/api/resumes/${item._id}`);
      if (!res.ok) throw new Error("Failed to load resume details");
      const fullResume = await res.json();
      setCurrentResume(fullResume);
      setEditableLatex(fullResume.latexContent || "");
      setPreviewMode(targetMode);

      if (fullResume.pdfBase64) {
        const byteCharacters = atob(fullResume.pdfBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/pdf" });
        if (pdfUrl) URL.revokeObjectURL(pdfUrl);
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      } else {
        setPdfUrl(`/api/resumes/${fullResume._id}/pdf`);
      }

      setStage(STAGES.DONE);
      window.scrollTo({ top: 160, behavior: "smooth" });
    } catch (err) {
      setStatusMessage({ type: "error", text: err.message });
    }
  };

  // Delete Saved Resume
  const handleDeleteResume = async (id) => {
    if (!isOwner) {
      if (triggerRestrictedAlert) {
        triggerRestrictedAlert(
          "Delete Resume from MongoDB",
          "Deleting saved resume records from the MongoDB database is restricted to the authenticated project owner."
        );
      }
      return;
    }

    if (!confirm("Are you sure you want to delete this saved resume from MongoDB?")) return;
    try {
      const res = await fetch(`/api/resumes/${id}`, {
        method: "DELETE",
        headers: { "x-owner-key": ownerToken },
      });
      if (!res.ok) throw new Error("Failed to delete resume");
      if (currentResume && currentResume._id === id) {
        setCurrentResume(null);
        if (pdfUrl) URL.revokeObjectURL(pdfUrl);
        setPdfUrl(null);
        setStage(STAGES.IDLE);
      }
      setStatusMessage({ type: "success", text: "Resume deleted successfully from MongoDB." });
      if (onRefreshResumes) onRefreshResumes();
    } catch (err) {
      setStatusMessage({ type: "error", text: err.message });
    }
  };

  const isLoading = [STAGES.READING, STAGES.ANALYZING, STAGES.COMPILING, STAGES.SAVING].includes(stage);

  // Filter Saved Resumes
  const filteredSavedResumes = savedResumes.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (r.title && r.title.toLowerCase().includes(q)) ||
      (r.targetRole && r.targetRole.toLowerCase().includes(q)) ||
      (r.company && r.company.toLowerCase().includes(q)) ||
      (r.keySkills && r.keySkills.some((s) => s.toLowerCase().includes(q)))
    );
  });

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      {/* Knowledge Base & XeLaTeX Status Bar */}
      <div className="resume-status-strip">
        <div className="status-box">
          <div className="status-box-icon">
            <Cpu size={20} />
          </div>
          <div>
            <div className="status-box-title">LaTeX Compiler</div>
            <div className="status-box-value">
              <span className="status-dot" style={{ background: kbStatus?.xelatexInstalled ? "#10b981" : "#f59e0b" }}></span>
              {kbStatus?.xelatexInstalled ? "MiKTeX XeTeX Active" : "XeLaTeX Checking..."}
            </div>
          </div>
        </div>

        <div className="status-box">
          <div className="status-box-icon">
            <FileText size={20} />
          </div>
          <div>
            <div className="status-box-title">Base Master Resume</div>
            <div className="status-box-value">
              <span className="status-dot" style={{ background: kbStatus?.resumeLoaded ? "#10b981" : "#ef4444" }}></span>
              {kbStatus?.resumeLoaded ? "kyvernitis-resume.cls Loaded" : "resume.tex Missing"}
            </div>
          </div>
        </div>

        <div className="status-box">
          <div className="status-box-icon">
            <BookOpen size={20} />
          </div>
          <div>
            <div className="status-box-title">Projects Knowledge Base</div>
            <div className="status-box-value">
              <span className="status-dot" style={{ background: "#10b981" }}></span>
              {kbStatus?.readmeCount ? `${kbStatus.readmeCount} Project READMEs` : "3 Readmes Loaded"}
            </div>
          </div>
        </div>

        <div className="status-box">
          <div className="status-box-icon">
            <Layers size={20} />
          </div>
          <div>
            <div className="status-box-title">MongoDB Atlas Storage</div>
            <div className="status-box-value">
              <span className="status-dot" style={{ background: "#10b981" }}></span>
              {savedResumes.length} Saved Resumes
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Workspace */}
      <div className="main-grid">
        {/* Left Column: Job Description & Controls */}
        <div className="glass-card">
          <h2 className="card-title">
            <div className="card-title-left">
              <Sparkles className="card-title-icon" size={22} />
              1. Target Job Description
            </div>
          </h2>

          <p style={{ fontSize: "0.83rem", color: "var(--text-muted)", marginBottom: "12px" }}>
            Paste any JD. Gemini AI selects matching projects from your knowledge base, aligns technical skills, and XeLaTeX compiles a crisp 1-page ATS PDF.
          </p>

          {/* Quick Presets */}
          <div style={{ marginBottom: "14px" }}>
            <label className="form-label" style={{ fontSize: "0.78rem" }}>Quick Preset Samples:</label>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {DEMO_JDS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="btn-secondary"
                  style={{ fontSize: "0.76rem", padding: "5px 10px" }}
                  onClick={() => setJobDescription(preset.text)}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleGenerate}>
            <div className="form-group">
              <label className="form-label">Job Description / Requirements *</label>
              <textarea
                className="form-textarea"
                style={{ minHeight: "230px" }}
                placeholder="Paste the full job description or requirements here..."
                required
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </div>

            {/* Project Count Selector */}
            <div className="form-group" style={{ marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label className="form-label" style={{ margin: 0, fontSize: "0.82rem", fontWeight: 600 }}>
                  Projects to Include in Resume:
                </label>
                <span style={{ fontSize: "0.74rem", color: "var(--accent-gold)", fontWeight: 600 }}>
                  {projectCount === 1 && "1 Project • Deep focus & maximum bullet detail"}
                  {projectCount === 2 && "2 Projects • Golden balance for clean 1-page ATS"}
                  {projectCount === 3 && "3 Projects • Broader multi-tech coverage"}
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                {[1, 2, 3].map((num) => {
                  const isSelected = projectCount === num;
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setProjectCount(num)}
                      style={{
                        padding: "8px 10px",
                        fontSize: "0.8rem",
                        fontWeight: isSelected ? 700 : 500,
                        borderRadius: "var(--radius-sm)",
                        border: isSelected ? "1.5px solid var(--accent-gold)" : "1px solid var(--border-color)",
                        background: isSelected ? "rgba(217, 119, 6, 0.15)" : "var(--bg-card-subtle)",
                        color: isSelected ? "var(--accent-gold)" : "var(--text-main)",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "2px",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        <span>{num} {num === 1 ? "Project" : "Projects"}</span>
                        {isSelected && <Check size={13} style={{ color: "var(--accent-gold)" }} />}
                      </div>
                      <span style={{ fontSize: "0.68rem", color: isSelected ? "var(--accent-gold)" : "var(--text-muted)" }}>
                        {num === 1 ? "Deep Focus" : num === 2 ? "Recommended" : "Multi-Stack"}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p style={{ fontSize: "0.73rem", color: "var(--text-muted)", marginTop: "6px", lineHeight: "1.4" }}>
                Gemini AI will rank all projects from your Knowledge Base and select the top <strong>{projectCount}</strong> best-matching project{projectCount > 1 ? "s" : ""} for this job description.
              </p>
            </div>

            {/* Stage Progress Bar */}
            {isLoading && (
              <div className="progress-steps">
                <div className={`step-item ${stage === STAGES.READING ? "active" : [STAGES.ANALYZING, STAGES.COMPILING, STAGES.SAVING, STAGES.DONE].includes(stage) ? "done" : ""}`}>
                  <div className="step-circle">1</div>
                  <span>Read KB</span>
                </div>
                <div className={`step-item ${stage === STAGES.ANALYZING ? "active" : [STAGES.COMPILING, STAGES.SAVING, STAGES.DONE].includes(stage) ? "done" : ""}`}>
                  <div className="step-circle">2</div>
                  <span>AI Tailoring</span>
                </div>
                <div className={`step-item ${stage === STAGES.COMPILING ? "active" : [STAGES.SAVING, STAGES.DONE].includes(stage) ? "done" : ""}`}>
                  <div className="step-circle">3</div>
                  <span>XeLaTeX</span>
                </div>
                <div className={`step-item ${stage === STAGES.SAVING ? "active" : stage === STAGES.DONE ? "done" : ""}`}>
                  <div className="step-circle">4</div>
                  <span>Save MongoDB</span>
                </div>
              </div>
            )}

            {error && (
              <div style={{ background: "rgba(244, 63, 94, 0.12)", border: "1px solid rgba(244, 63, 94, 0.3)", borderRadius: "var(--radius-sm)", padding: "10px 14px", color: "#fda4af", fontSize: "0.84rem", marginBottom: "14px" }}>
                <AlertCircle size={15} style={{ display: "inline", marginRight: "6px", verticalAlign: "middle" }} />
                {error}
              </div>
            )}

            {quotaNotice && (
              <div
                style={{
                  background: "rgba(245, 158, 11, 0.12)",
                  border: "1px solid rgba(245, 158, 11, 0.35)",
                  borderRadius: "var(--radius-sm)",
                  padding: "12px 14px",
                  color: "#fbbf24",
                  fontSize: "0.83rem",
                  marginBottom: "14px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                }}
              >
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: "2px", color: "#f59e0b" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, marginBottom: "2px" }}>Google Gemini API Daily Quota Exceeded (429)</div>
                  <div style={{ fontSize: "0.78rem", color: "rgba(251, 191, 36, 0.9)", lineHeight: "1.45" }}>
                    Your Google AI Studio daily free quota or rate limit has been reached. The resume was compiled safely using your <strong>Master Base Template</strong> without AI modifications. Please wait for the cooldown or check your API key quota before regenerating.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setQuotaNotice(null)}
                  style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: "2px", fontSize: "0.9rem" }}
                  title="Dismiss alert"
                >
                  ✕
                </button>
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={isLoading || !jobDescription.trim()}>
              {isLoading ? (
                <>
                  <Loader2 className="spin" size={20} />
                  {stage === STAGES.READING && "Reading Master Resume & Project READMEs..."}
                  {stage === STAGES.ANALYZING && "AI Optimizing Projects & Skills for JD..."}
                  {stage === STAGES.COMPILING && "XeLaTeX Compiling 1-Page PDF..."}
                  {stage === STAGES.SAVING && "Saving to MongoDB Atlas..."}
                </>
              ) : (
                <>
                  <FileText size={20} />
                  Generate Tailored ATS Resume
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Live Resume Preview & Actions */}
        <div className="glass-card">
          <h2 className="card-title">
            <div className="card-title-left">
              <FileText className="card-title-icon" size={22} />
              2. Live Resume Preview &amp; Actions
            </div>
            {currentResume && (
              <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                {/* Switcher Tabs */}
                <div style={{ display: "flex", background: "var(--bg-card-subtle)", borderRadius: "var(--radius-sm)", padding: "2px", border: "1px solid var(--border-color)" }}>
                  <button
                    type="button"
                    style={{
                      padding: "5px 12px",
                      fontSize: "0.78rem",
                      borderRadius: "var(--radius-sm)",
                      border: "none",
                      background: previewMode === "pdf" ? "var(--primary)" : "transparent",
                      color: previewMode === "pdf" ? "#FAF8F5" : "var(--text-muted)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      fontWeight: previewMode === "pdf" ? 700 : 500,
                      transition: "all 0.15s ease",
                    }}
                    onClick={() => setPreviewMode("pdf")}
                  >
                    <Eye size={13} />
                    <span>PDF Preview</span>
                  </button>
                  <button
                    type="button"
                    style={{
                      padding: "5px 12px",
                      fontSize: "0.78rem",
                      borderRadius: "var(--radius-sm)",
                      border: "none",
                      background: previewMode === "latex" ? "var(--primary)" : "transparent",
                      color: previewMode === "latex" ? "#FAF8F5" : "var(--text-muted)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      fontWeight: previewMode === "latex" ? 700 : 500,
                      transition: "all 0.15s ease",
                    }}
                    onClick={() => setPreviewMode("latex")}
                  >
                    <Code size={13} />
                    <span>Edit LaTeX Code</span>
                  </button>
                </div>

                <button
                  type="button"
                  className="btn-primary btn-emerald"
                  style={{ padding: "6px 14px", fontSize: "0.8rem" }}
                  onClick={handleDownloadPdf}
                >
                  <Download size={14} />
                  Download PDF
                </button>
              </div>
            )}
          </h2>

          {currentResume ? (
            <div>
              {/* Meta Card */}
              <div style={{ background: "var(--bg-card-subtle)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", padding: "14px 16px", marginBottom: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px" }}>
                  <div>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: "700", color: "var(--text-main)", fontFamily: "var(--font-serif)" }}>
                      {currentResume.title}
                    </h3>
                    <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                      {currentResume.summary || `Tailored for ${currentResume.targetRole}`}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn-primary"
                    style={{ padding: "6px 14px", fontSize: "0.82rem" }}
                    onClick={() => onApplyInSendMail(currentResume)}
                  >
                    <Send size={14} />
                    Attach in Send Mail
                  </button>
                </div>

                {/* Highlighted Skills & Projects */}
                <div style={{ marginTop: "10px" }}>
                  <div style={{ fontSize: "0.74rem", textTransform: "uppercase", letterSpacing: "0.6px", color: "var(--text-subtle)", fontWeight: "700" }}>
                    Selected Projects &amp; Highlighted Skills
                  </div>
                  <div className="tag-cloud">
                    {currentResume.selectedProjects?.map((p, i) => (
                      <span key={i} className="project-tag">
                        ⭐ {p}
                      </span>
                    ))}
                    {currentResume.keySkills?.map((s, i) => (
                      <span key={i} className="skill-tag">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* View Mode 1: PDF Preview Frame */}
              {previewMode === "pdf" && (
                <div>
                  {pdfUrl ? (
                    <iframe
                      src={pdfUrl}
                      className="resume-pdf-frame"
                      title="Tailored Resume Preview"
                    />
                  ) : (
                    <div style={{ textAlign: "center", padding: "40px", background: "var(--bg-card-subtle)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}>
                      <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                        PDF ready. Click Download PDF or View in Browser.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* View Mode 2: Interactive LaTeX Code Editor & Recompile */}
              {previewMode === "latex" && (
                <div style={{ animation: "fadeIn 0.2s ease" }}>
                  {/* Editor Action Bar */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", flexWrap: "wrap", gap: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Code size={15} style={{ color: "var(--accent-gold)" }} />
                      <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-main)" }}>
                        Direct LaTeX Editor (Saved in MongoDB)
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ padding: "5px 10px", fontSize: "0.76rem" }}
                        onClick={handleCopyLatex}
                        title="Copy LaTeX code to clipboard"
                      >
                        {copiedLatex ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                        <span>{copiedLatex ? "Copied!" : "Copy"}</span>
                      </button>
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ padding: "5px 10px", fontSize: "0.76rem" }}
                        onClick={() => {
                          setEditableLatex(currentResume.latexContent || "");
                          setStatusMessage({ type: "success", text: "Reverted code back to last saved version." });
                        }}
                        title="Revert back to last saved LaTeX code"
                      >
                        <RotateCcw size={13} />
                        <span>Revert</span>
                      </button>
                      <button
                        type="button"
                        className="btn-primary"
                        style={{ padding: "5px 14px", fontSize: "0.78rem", display: "flex", alignItems: "center", gap: "6px" }}
                        onClick={handleRecompileAndSave}
                        disabled={isRecompiling}
                        title={isOwner ? "Recompile LaTeX via XeLaTeX and update PDF in MongoDB" : "Owner only: Recompile & Save to MongoDB"}
                      >
                        {isRecompiling ? <Loader2 size={13} className="spin" /> : <Save size={13} />}
                        <span>{isRecompiling ? "Recompiling..." : "Confirm & Save to MongoDB"}</span>
                        {!isOwner && <span className="btn-restricted-tag">🔒 Owner Only</span>}
                      </button>
                    </div>
                  </div>

                  {/* Code Editor Textarea */}
                  <textarea
                    value={editableLatex}
                    onChange={(e) => setEditableLatex(e.target.value)}
                    rows={24}
                    className="form-textarea"
                    style={{
                      width: "100%",
                      fontFamily: "var(--font-code)",
                      fontSize: "0.8rem",
                      lineHeight: "1.65",
                      background: "#18181B",
                      color: "#FAF8F5",
                      padding: "16px",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border-strong)",
                    }}
                    placeholder="Edit your LaTeX resume code here..."
                    spellCheck="false"
                  />

                  {/* Helper Tip */}
                  <div style={{ marginTop: "10px", padding: "10px 14px", background: "var(--bg-card-subtle)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)", fontSize: "0.76rem", color: "var(--text-muted)", lineHeight: "1.5" }}>
                    💡 <strong>Custom Editing:</strong> Make any manual changes to your bullet points, technical skills, projects, or dates in the LaTeX editor above. When done, click <strong>"Confirm &amp; Save to MongoDB"</strong> — Sendora runs local XeLaTeX in real-time, compiles your new PDF, and saves the updated code directly into your MongoDB Atlas database.
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
              <div style={{ width: "54px", height: "54px", borderRadius: "50%", background: "#F4EFE6", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "var(--text-main)" }}>
                <FileText size={28} />
              </div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: "700", color: "var(--text-main)", fontFamily: "var(--font-serif)", marginBottom: "6px" }}>
                No Resume Generated Yet
              </h3>
              <p style={{ fontSize: "0.85rem", maxWidth: "380px", margin: "0 auto 16px", color: "var(--text-muted)" }}>
                Paste a target Job Description on the left and click <strong>Generate Tailored ATS Resume</strong> to see your live 1-page XeLaTeX preview here.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section: MongoDB Saved Resumes Library */}
      <section className="glass-card" style={{ marginTop: "24px" }}>
        <div className="card-title">
          <div className="card-title-left">
            <Layers className="card-title-icon" size={22} />
            MongoDB Saved Resumes Library ({savedResumes.length})
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <div style={{ position: "relative", minWidth: "220px" }}>
              <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-subtle)" }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: "30px", fontSize: "0.82rem", padding: "6px 12px 6px 30px" }}
                placeholder="Search saved resumes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              type="button"
              className="btn-secondary"
              style={{ padding: "6px 10px" }}
              onClick={onRefreshResumes}
              title="Refresh MongoDB Resumes"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {filteredSavedResumes.length === 0 ? (
          <p style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)", fontSize: "0.88rem" }}>
            {savedResumes.length === 0
              ? "No resumes saved in MongoDB yet. Generate your first one above!"
              : "No resumes match your search query."}
          </p>
        ) : (
          <div className="logs-table-wrapper">
            <table className="logs-table">
              <thead>
                <tr>
                  <th>Resume Title & Target Role</th>
                  <th>Company</th>
                  <th>Projects Highlighted</th>
                  <th>Key Skills</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSavedResumes.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <div style={{ fontWeight: "700", color: "var(--text-main)" }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: "0.76rem", color: "var(--text-subtle)" }}>
                        {item.targetRole || "Software Engineer"}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.84rem", color: item.company ? "var(--text-main)" : "var(--text-subtle)" }}>
                        {item.company || "General"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", alignItems: "center" }}>
                        {item.projectCount && (
                          <span style={{ fontSize: "0.66rem", padding: "2px 6px", background: "rgba(217, 119, 6, 0.15)", color: "var(--accent-gold)", borderRadius: "4px", fontWeight: 700 }}>
                            {item.projectCount} {item.projectCount === 1 ? "Project" : "Projects"}
                          </span>
                        )}
                        {item.selectedProjects && item.selectedProjects.length > 0 ? (
                          item.selectedProjects.map((p, i) => (
                            <span key={i} className="project-tag" style={{ fontSize: "0.68rem" }}>
                              {p}
                            </span>
                          ))
                        ) : (
                          <span style={{ color: "var(--text-subtle)", fontSize: "0.76rem" }}>Base Projects</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", maxWidth: "260px" }}>
                        {item.keySkills && item.keySkills.length > 0 ? (
                          item.keySkills.slice(0, 4).map((s, i) => (
                            <span key={i} className="skill-tag" style={{ fontSize: "0.68rem" }}>
                              {s}
                            </span>
                          ))
                        ) : (
                          <span style={{ color: "var(--text-subtle)", fontSize: "0.76rem" }}>Core Tech</span>
                        )}
                      </div>
                    </td>
                    <td style={{ fontSize: "0.78rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          type="button"
                          className="btn-secondary"
                          style={{ padding: "4px 8px", fontSize: "0.74rem" }}
                          title="Preview PDF"
                          onClick={() => handleSelectSavedResume(item, "pdf")}
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          type="button"
                          className="btn-secondary"
                          style={{ padding: "4px 8px", fontSize: "0.74rem" }}
                          title="Edit LaTeX Code & Recompile"
                          onClick={() => handleSelectSavedResume(item, "latex")}
                        >
                          <Code size={13} />
                        </button>
                        <a
                          href={`/api/resumes/${item._id}/pdf`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-secondary"
                          style={{ padding: "4px 8px", fontSize: "0.74rem", textDecoration: "none" }}
                          title="Download / Open PDF"
                        >
                          <Download size={13} />
                        </a>
                        <button
                          type="button"
                          className="btn-primary"
                          style={{ padding: "4px 10px", fontSize: "0.74rem" }}
                          title="Use this resume in Send Mail"
                          onClick={() => onApplyInSendMail(item)}
                        >
                          <Send size={12} /> Use
                        </button>
                        <button
                          type="button"
                          className="btn-secondary"
                          style={{ padding: "4px 8px", fontSize: "0.74rem", color: isOwner ? "#fb7185" : "var(--text-subtle)" }}
                          title={isOwner ? "Delete from MongoDB" : "Delete from MongoDB (Owner Only)"}
                          onClick={() => handleDeleteResume(item._id)}
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
    </div>
  );
}
