import React, { useState, useEffect } from "react";
import {
  Database,
  Plus,
  Trash2,
  Edit3,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Code,
  Sparkles,
  ExternalLink,
  FileText,
  Layers,
  Search,
  BookOpen,
  Check,
  X,
  RefreshCw,
  Eye,
  Upload,
} from "lucide-react";

// Social GitHub Icon SVG
const GithubIcon = ({ size = 15, color = "currentColor", className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={{ display: "inline-block", verticalAlign: "middle" }}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export default function KnowledgeBaseManager({
  isOwner = false,
  ownerToken = "",
  triggerRestrictedAlert,
}) {
  const [activeSubTab, setActiveSubTab] = useState("projects"); // 'projects' | 'resume'

  // Projects State
  const [projects, setProjects] = useState([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State for Projects
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [projectForm, setProjectForm] = useState({
    title: "",
    tagline: "",
    techStack: "",
    content: "",
    repoUrl: "",
    liveUrl: "",
    isFeatured: true,
  });

  // GitHub Import State
  const [isGithubModalOpen, setIsGithubModalOpen] = useState(false);
  const [githubRepoUrl, setGithubRepoUrl] = useState("");
  const [isImportingGithub, setIsImportingGithub] = useState(false);

  // Master Resume State
  const [masterResume, setMasterResume] = useState({
    title: "Master ATS LaTeX Resume",
    latexContent: "",
    clsContent: "",
    notes: "",
    version: 1,
    updatedAt: null,
  });
  const [resumeEditorTab, setResumeEditorTab] = useState("tex"); // 'tex' | 'cls'
  const [isLoadingResume, setIsLoadingResume] = useState(false);
  const [isSavingResume, setIsSavingResume] = useState(false);
  const [isResettingResume, setIsResettingResume] = useState(false);

  // Handle uploading .tex or .cls file directly
  const handleUploadResumeFile = (e) => {
    if (!isOwner) {
      if (triggerRestrictedAlert) {
        triggerRestrictedAlert(
          "Upload LaTeX Template File",
          "Uploading external LaTeX templates to replace the active master resume is restricted to the portfolio owner."
        );
      }
      e.target.value = "";
      return;
    }

    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      if (file.name.endsWith(".cls")) {
        setMasterResume((prev) => ({ ...prev, clsContent: content }));
        setResumeEditorTab("cls");
        showBanner("success", `Loaded "${file.name}" into Document Class editor! Click "Save to MongoDB" to persist.`);
      } else {
        setMasterResume((prev) => ({ ...prev, latexContent: content }));
        setResumeEditorTab("tex");
        showBanner("success", `Loaded "${file.name}" into LaTeX Template editor! Click "Save to MongoDB" to persist.`);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Banner Notification State
  const [banner, setBanner] = useState(null);

  const showBanner = (type, text) => {
    setBanner({ type, text });
    setTimeout(() => {
      setBanner(null);
    }, 4500);
  };

  // Fetch Projects from MongoDB
  const fetchProjects = async () => {
    setIsLoadingProjects(true);
    try {
      const res = await fetch("/api/knowledge/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.warn("Failed to fetch projects:", err);
      showBanner("error", "Could not load projects from MongoDB.");
    } finally {
      setIsLoadingProjects(false);
    }
  };

  // Fetch Master Resume from MongoDB
  const fetchMasterResume = async () => {
    setIsLoadingResume(true);
    try {
      const res = await fetch("/api/knowledge/master-resume");
      if (res.ok) {
        const data = await res.json();
        if (data) setMasterResume(data);
      }
    } catch (err) {
      console.warn("Failed to fetch master resume:", err);
    } finally {
      setIsLoadingResume(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchMasterResume();
  }, []);

  // Handle Project Form Open (Create or Edit)
  const openNewProjectModal = () => {
    if (!isOwner) {
      if (triggerRestrictedAlert) {
        triggerRestrictedAlert(
          "Add New Project to Knowledge Base",
          "Adding new projects to the MongoDB Knowledge Base is reserved for the portfolio owner. Visitors can freely view existing projects and their technical architecture."
        );
      }
      return;
    }
    setEditingProjectId(null);
    setProjectForm({
      title: "",
      tagline: "",
      techStack: "",
      content: `# Project Title\n\n## Overview\nDescribe your project and core architectural decisions...\n\n## Key Architecture & Features\n- 15+ RESTful endpoints with role-based auth\n- Microservices resilience and caching\n\n## Tech Stack\nReact, Node.js, Express, MongoDB\n`,
      repoUrl: "",
      liveUrl: "",
      isFeatured: true,
    });
    setIsProjectModalOpen(true);
  };

  const openEditProjectModal = (proj) => {
    if (!isOwner) {
      if (triggerRestrictedAlert) {
        triggerRestrictedAlert(
          "Edit Project in Knowledge Base",
          "Modifying existing projects and markdown documentation in MongoDB is restricted to the portfolio owner."
        );
      }
      return;
    }
    setEditingProjectId(proj._id);
    setProjectForm({
      title: proj.title || "",
      tagline: proj.tagline || "",
      techStack: Array.isArray(proj.techStack) ? proj.techStack.join(", ") : proj.techStack || "",
      content: proj.content || "",
      repoUrl: proj.repoUrl || "",
      liveUrl: proj.liveUrl || "",
      isFeatured: proj.isFeatured !== false,
    });
    setIsProjectModalOpen(true);
  };

  // Save Project (Create / Update)
  const handleSaveProject = async (e) => {
    e.preventDefault();
    if (!isOwner) {
      if (triggerRestrictedAlert) triggerRestrictedAlert("Save Project to MongoDB", "Action restricted to authenticated owner.");
      return;
    }
    if (!projectForm.title.trim() || !projectForm.content.trim()) {
      showBanner("error", "Project Title and Markdown Content are required.");
      return;
    }

    try {
      const url = editingProjectId
        ? `/api/knowledge/projects/${editingProjectId}`
        : "/api/knowledge/projects";
      const method = editingProjectId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-owner-key": ownerToken,
        },
        body: JSON.stringify(projectForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save project");

      showBanner("success", editingProjectId ? `Updated "${projectForm.title}" in MongoDB!` : `Saved "${projectForm.title}" to MongoDB!`);
      setIsProjectModalOpen(false);
      fetchProjects();
    } catch (err) {
      showBanner("error", err.message || "Failed to save project.");
    }
  };

  // Delete Project
  const handleDeleteProject = async (id, title) => {
    if (!isOwner) {
      if (triggerRestrictedAlert) {
        triggerRestrictedAlert(
          "Delete Project from Knowledge Base",
          "Deleting project records from MongoDB is restricted to the portfolio owner."
        );
      }
      return;
    }

    if (!window.confirm(`Are you sure you want to remove "${title}" from your MongoDB knowledge base?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/knowledge/projects/${id}`, {
        method: "DELETE",
        headers: { "x-owner-key": ownerToken },
      });
      if (!res.ok) throw new Error("Failed to delete project");

      showBanner("success", `Project "${title}" deleted.`);
      fetchProjects();
    } catch (err) {
      showBanner("error", err.message || "Failed to delete project.");
    }
  };

  // Toggle Featured State
  const handleToggleFeatured = async (proj) => {
    if (!isOwner) {
      if (triggerRestrictedAlert) {
        triggerRestrictedAlert(
          "Toggle Project Status",
          "Enabling or disabling projects for AI resume tailoring is restricted to the portfolio owner."
        );
      }
      return;
    }

    const updatedStatus = !proj.isFeatured;
    try {
      const res = await fetch(`/api/knowledge/projects/${proj._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-owner-key": ownerToken,
        },
        body: JSON.stringify({ isFeatured: updatedStatus }),
      });
      if (res.ok) {
        setProjects((prev) =>
          prev.map((p) => (p._id === proj._id ? { ...p, isFeatured: updatedStatus } : p))
        );
        showBanner("success", updatedStatus ? `"${proj.title}" active in AI tailoring.` : `"${proj.title}" disabled from AI tailoring.`);
      }
    } catch (err) {
      showBanner("error", "Failed to update project status.");
    }
  };

  // GitHub Import Handler
  const handleImportGithub = async (e) => {
    e.preventDefault();
    if (!isOwner) {
      if (triggerRestrictedAlert) {
        triggerRestrictedAlert(
          "Import Projects from GitHub",
          "Importing external GitHub READMEs directly into the MongoDB database is restricted to the portfolio owner."
        );
      }
      return;
    }

    if (!githubRepoUrl.trim()) return;

    setIsImportingGithub(true);
    try {
      const res = await fetch("/api/knowledge/projects/github-import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-owner-key": ownerToken,
        },
        body: JSON.stringify({ repoUrl: githubRepoUrl, autoSave: true }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "GitHub import failed");

      showBanner("success", data.message || "Imported README from GitHub!");
      setGithubRepoUrl("");
      setIsGithubModalOpen(false);
      fetchProjects();
    } catch (err) {
      showBanner("error", err.message || "Failed to import from GitHub.");
    } finally {
      setIsImportingGithub(false);
    }
  };

  // Save Master LaTeX Resume
  const handleSaveMasterResume = async () => {
    if (!isOwner) {
      if (triggerRestrictedAlert) {
        triggerRestrictedAlert(
          "Save Master LaTeX Template to MongoDB",
          "Updating the core LaTeX template or document class in MongoDB is restricted to the portfolio owner. Guests can view, test, and copy the LaTeX code."
        );
      }
      return;
    }

    if (!masterResume.latexContent?.trim()) {
      showBanner("error", "LaTeX template content cannot be empty.");
      return;
    }

    setIsSavingResume(true);
    try {
      const res = await fetch("/api/knowledge/master-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-owner-key": ownerToken,
        },
        body: JSON.stringify({
          title: masterResume.title,
          latexContent: masterResume.latexContent,
          clsContent: masterResume.clsContent,
          notes: masterResume.notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save master resume");

      if (data.masterResume) setMasterResume(data.masterResume);
      showBanner("success", "Master ATS LaTeX template and document class saved to MongoDB!");
    } catch (err) {
      showBanner("error", err.message || "Failed to save master resume.");
    } finally {
      setIsSavingResume(false);
    }
  };

  // Reset Master Resume to Default
  const handleResetMasterResume = async () => {
    if (!isOwner) {
      if (triggerRestrictedAlert) {
        triggerRestrictedAlert(
          "Reset Master Resume Template",
          "Resetting the master LaTeX template is restricted to the portfolio owner."
        );
      }
      return;
    }

    if (!window.confirm("Reset your master resume in MongoDB back to the default golden ATS template?")) {
      return;
    }

    setIsResettingResume(true);
    try {
      const res = await fetch("/api/knowledge/master-resume/reset", {
        method: "POST",
        headers: { "x-owner-key": ownerToken },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Reset failed");

      if (data.masterResume) setMasterResume(data.masterResume);
      showBanner("success", "Master resume reset to default template.");
    } catch (err) {
      showBanner("error", err.message || "Reset failed.");
    } finally {
      setIsResettingResume(false);
    }
  };

  // Filtered projects
  const filteredProjects = projects.filter((p) => {
    const q = searchQuery.toLowerCase();
    const titleMatch = p.title?.toLowerCase().includes(q);
    const techMatch = Array.isArray(p.techStack) && p.techStack.some((t) => t.toLowerCase().includes(q));
    const taglineMatch = p.tagline?.toLowerCase().includes(q);
    return titleMatch || techMatch || taglineMatch;
  });

  return (
    <div className="kb-container" style={{ animation: "fadeIn 0.25s ease-out" }}>
      {/* Banner Alert */}
      {banner && (
        <div className={`banner ${banner.type === "success" ? "banner-success" : "banner-error"}`} style={{ marginBottom: "18px" }}>
          {banner.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span style={{ flex: 1, fontSize: "0.86rem", fontWeight: 600 }}>{banner.text}</span>
          <button
            type="button"
            onClick={() => setBanner(null)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", padding: "2px" }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header Info Card */}
      <div className="glass-card" style={{ marginBottom: "22px", position: "relative" }}>
        <div className="kb-header-flex">
          <div>
            <div className="kb-eyebrow">
              <Database size={13} />
              <span>MongoDB Cloud Knowledge Base</span>
            </div>
            <h1 className="card-title" style={{ fontSize: "1.45rem", marginBottom: "6px" }}>
              Knowledge Base Studio
            </h1>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", maxWidth: "700px", lineHeight: "1.6" }}>
              Store and manage your <strong>Project READMEs</strong> and <strong>Master ATS LaTeX Template</strong> in MongoDB Atlas. Everything stored here is dynamically retrieved by Gemini AI when tailoring cold outreach emails and custom resumes.
            </p>
          </div>

          {/* Sub Tab Switcher */}
          <div className="kb-subtab-tray">
            <button
              type="button"
              onClick={() => setActiveSubTab("projects")}
              className={`kb-subtab-btn ${activeSubTab === "projects" ? "active" : ""}`}
            >
              <BookOpen size={15} />
              <span>Project READMEs ({projects.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab("resume")}
              className={`kb-subtab-btn ${activeSubTab === "resume" ? "active" : ""}`}
            >
              <FileText size={15} />
              <span>Master LaTeX Resume</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: PROJECT READMES */}
      {/* ============================================================ */}
      {activeSubTab === "projects" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {/* Action & Search Bar */}
          <div className="kb-toolbar">
            <div className="kb-search-box">
              <Search size={15} className="kb-search-icon" />
              <input
                type="text"
                placeholder="Search projects by title or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input kb-search-input"
              />
            </div>

            <div className="kb-actions-row">
              <button
                type="button"
                onClick={() => {
                  if (!isOwner) {
                    triggerRestrictedAlert(
                      "Import Projects from GitHub",
                      "Importing external GitHub READMEs directly into MongoDB is reserved for the portfolio owner."
                    );
                    return;
                  }
                  setIsGithubModalOpen(true);
                }}
                className="btn-secondary"
                style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "0.82rem" }}
              >
                <GithubIcon size={15} />
                <span>Import from GitHub</span>
                {!isOwner && <span className="btn-restricted-tag">🔒 Owner</span>}
              </button>
              <button
                type="button"
                onClick={openNewProjectModal}
                className="btn-primary"
                style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "0.82rem" }}
              >
                <Plus size={16} />
                <span>Add New Project</span>
                {!isOwner && <span className="btn-restricted-tag">🔒 Owner</span>}
              </button>
            </div>
          </div>

          {/* Project Cards Grid */}
          {isLoadingProjects ? (
            <div className="glass-card" style={{ textAlign: "center", padding: "48px 24px" }}>
              <Loader2 className="spin" size={32} style={{ margin: "0 auto 12px", color: "var(--accent-gold)" }} />
              <p style={{ fontSize: "0.88rem", color: "var(--text-muted)" }}>Loading projects from MongoDB Atlas...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="glass-card" style={{ textAlign: "center", padding: "52px 24px" }}>
              <BookOpen size={42} style={{ margin: "0 auto 14px", color: "var(--text-subtle)", opacity: 0.6 }} />
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "6px" }}>
                No Projects Found
              </h3>
              <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", maxWidth: "420px", margin: "0 auto 18px" }}>
                {searchQuery
                  ? "No projects match your search criteria. Try a different keyword."
                  : "You haven't added any project READMEs to MongoDB yet. Add a project or import directly from GitHub!"}
              </p>
              <button type="button" onClick={openNewProjectModal} className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "7px" }}>
                <Plus size={15} /> Add Your First Project
              </button>
            </div>
          ) : (
            <div className="kb-projects-grid">
              {filteredProjects.map((proj) => (
                <div key={proj._id} className="kb-project-card">
                  <div>
                    {/* Header */}
                    <div className="kb-card-header">
                      <div>
                        <h3 className="kb-card-title">{proj.title}</h3>
                        {proj.tagline && <p className="kb-card-tagline">{proj.tagline}</p>}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(proj)}
                        className={`kb-badge-toggle ${proj.isFeatured ? "featured" : "disabled"}`}
                        title={proj.isFeatured ? "Active in AI tailoring (Click to disable)" : "Inactive in AI tailoring (Click to enable)"}
                      >
                        {proj.isFeatured && <Check size={11} />}
                        <span>{proj.isFeatured ? "AI Active" : "Disabled"}</span>
                      </button>
                    </div>

                    {/* Tech Stack Chips */}
                    {proj.techStack && proj.techStack.length > 0 && (
                      <div className="kb-chips-row">
                        {proj.techStack.map((tech, idx) => (
                          <span key={idx} className="project-tag" style={{ fontSize: "0.72rem", padding: "2px 7px" }}>
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Markdown Preview Snippet */}
                    <div className="kb-snippet-box">
                      {proj.content?.substring(0, 180)}...
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="kb-card-footer">
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      {proj.repoUrl && (
                        <a
                          href={proj.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="kb-link"
                        >
                          <GithubIcon size={13} />
                          <span>Repo</span>
                        </a>
                      )}
                      {proj.liveUrl && (
                        <a
                          href={proj.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="kb-link"
                        >
                          <ExternalLink size={13} />
                          <span>Demo</span>
                        </a>
                      )}
                      {proj.source === "github_import" && (
                        <span style={{ fontSize: "0.7rem", color: "var(--accent-gold)", fontWeight: 600 }}>GitHub Sync</span>
                      )}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <button
                        type="button"
                        onClick={() => openEditProjectModal(proj)}
                        className="btn-secondary"
                        style={{ padding: "4px 8px", fontSize: "0.76rem" }}
                        title="Edit Project & Markdown"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProject(proj._id, proj.title)}
                        className="btn-secondary"
                        style={{ padding: "4px 8px", fontSize: "0.76rem", color: "var(--accent-crimson)" }}
                        title="Delete Project from MongoDB"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: MASTER LATEX RESUME */}
      {/* ============================================================ */}
      {activeSubTab === "resume" && (
        <div className="glass-card" style={{ padding: "24px" }}>
          <div className="kb-latex-header">
            <div>
              <h2 className="card-title" style={{ fontSize: "1.15rem", marginBottom: "4px" }}>
                <Code size={18} style={{ color: "var(--accent-gold)", verticalAlign: "middle", marginRight: "6px" }} />
                Master LaTeX ATS Template
              </h2>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                This LaTeX template is stored in MongoDB Atlas and compiled via XeLaTeX with <code>kyvernitis-resume.cls</code>. Gemini AI analyzes this document and dynamically matches your project experiences and skills.
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button
                type="button"
                onClick={handleResetMasterResume}
                disabled={isResettingResume}
                className="btn-secondary"
                style={{ fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "6px" }}
                title="Reset back to default template"
              >
                <RotateCcw size={14} className={isResettingResume ? "spin" : ""} />
                <span>Reset to Default</span>
                {!isOwner && <span className="btn-restricted-tag">🔒 Owner</span>}
              </button>
              <button
                type="button"
                onClick={handleSaveMasterResume}
                disabled={isSavingResume}
                className="btn-primary"
                style={{ fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "6px" }}
              >
                {isSavingResume ? <Loader2 size={14} className="spin" /> : <Save size={14} />}
                <span>Save to MongoDB</span>
                {!isOwner && <span className="btn-restricted-tag">🔒 Owner</span>}
              </button>
            </div>
          </div>

          {isLoadingResume ? (
            <div style={{ textAlign: "center", padding: "48px" }}>
              <Loader2 className="spin" size={28} style={{ color: "var(--accent-gold)", margin: "0 auto 10px" }} />
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontFamily: "var(--font-code)" }}>
                Loading master LaTeX & document class from MongoDB...
              </p>
            </div>
          ) : (
            <div style={{ marginTop: "18px" }}>
              {/* File Selector & Upload Controls */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", flexWrap: "wrap", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={() => setResumeEditorTab("tex")}
                    className={resumeEditorTab === "tex" ? "btn-primary" : "btn-secondary"}
                    style={{ fontSize: "0.8rem", padding: "6px 14px", display: "flex", alignItems: "center", gap: "6px" }}
                  >
                    <FileText size={14} />
                    <span>resume.tex (Template)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setResumeEditorTab("cls")}
                    className={resumeEditorTab === "cls" ? "btn-primary" : "btn-secondary"}
                    style={{ fontSize: "0.8rem", padding: "6px 14px", display: "flex", alignItems: "center", gap: "6px" }}
                  >
                    <Layers size={14} />
                    <span>kyvernitis-resume.cls (Class)</span>
                  </button>
                </div>

                <label
                  className="btn-secondary"
                  style={{
                    fontSize: "0.8rem",
                    padding: "6px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    cursor: "pointer",
                    margin: 0,
                  }}
                  title="Upload a .tex or .cls file from your computer"
                >
                  <Upload size={14} />
                  <span>Upload .tex / .cls File</span>
                  <input
                    type="file"
                    accept=".tex,.cls,.txt"
                    onChange={handleUploadResumeFile}
                    style={{ display: "none" }}
                  />
                </label>
              </div>

              {/* Meta bar */}
              <div className="kb-latex-meta">
                <span>
                  {resumeEditorTab === "tex"
                    ? "📄 resume.tex • Master ATS Document Structure (MongoDB)"
                    : "⚙️ kyvernitis-resume.cls • LaTeX Document Class & Font Engine (MongoDB)"}
                </span>
                <span>
                  Version {masterResume.version || 1} •{" "}
                  {masterResume.updatedAt
                    ? `Last Updated: ${new Date(masterResume.updatedAt).toLocaleDateString()}`
                    : "MongoDB Active"}
                </span>
              </div>

              {/* Code Editor */}
              {resumeEditorTab === "tex" ? (
                <textarea
                  value={masterResume.latexContent || ""}
                  onChange={(e) => setMasterResume({ ...masterResume, latexContent: e.target.value })}
                  rows={22}
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
                  placeholder="Paste or write your master LaTeX ATS resume here..."
                  spellCheck="false"
                />
              ) : (
                <textarea
                  value={masterResume.clsContent || ""}
                  onChange={(e) => setMasterResume({ ...masterResume, clsContent: e.target.value })}
                  rows={22}
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
                  placeholder="Paste or write your kyvernitis-resume.cls LaTeX class definition here..."
                  spellCheck="false"
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 1: ADD / EDIT PROJECT (MARKDOWN) */}
      {/* ============================================================ */}
      {isProjectModalOpen && (
        <div className="kb-modal-backdrop">
          <div className="kb-modal-card">
            {/* Modal Header */}
            <div className="kb-modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <BookOpen size={18} style={{ color: "var(--accent-gold)" }} />
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-main)" }}>
                  {editingProjectId ? "Edit Project README" : "Add New Project (Markdown)"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsProjectModalOpen(false)}
                className="kb-close-btn"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProject} className="kb-modal-body">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div className="form-group">
                  <label className="form-label">Project Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ShopNow, Horizon LMS, Sendora"
                    value={projectForm.title}
                    onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Tagline / Short Subtitle</label>
                  <input
                    type="text"
                    placeholder="e.g. Distributed E-Commerce Microservices Platform"
                    value={projectForm.tagline}
                    onChange={(e) => setProjectForm({ ...projectForm, tagline: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div className="form-group">
                  <label className="form-label">Tech Stack (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="React, Node.js, Express, MongoDB, Redux"
                    value={projectForm.techStack}
                    onChange={(e) => setProjectForm({ ...projectForm, techStack: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">GitHub Repository URL</label>
                  <input
                    type="url"
                    placeholder="https://github.com/RahulPrasad-78/ShopNow"
                    value={projectForm.repoUrl}
                    onChange={(e) => setProjectForm({ ...projectForm, repoUrl: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Full Markdown README Content *</span>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-subtle)", fontFamily: "var(--font-code)" }}>Markdown formatted</span>
                </label>
                <textarea
                  rows={13}
                  required
                  value={projectForm.content}
                  onChange={(e) => setProjectForm({ ...projectForm, content: e.target.value })}
                  className="form-textarea"
                  style={{ fontFamily: "var(--font-code)", fontSize: "0.8rem", lineHeight: "1.6" }}
                  placeholder="# Project Title..."
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                <input
                  type="checkbox"
                  id="isFeaturedCheck"
                  checked={projectForm.isFeatured}
                  onChange={(e) => setProjectForm({ ...projectForm, isFeatured: e.target.checked })}
                  style={{ cursor: "pointer", width: "16px", height: "16px", accentColor: "var(--primary)" }}
                />
                <label htmlFor="isFeaturedCheck" style={{ fontSize: "0.82rem", color: "var(--text-main)", cursor: "pointer" }}>
                  Include this project in AI Resume tailoring &amp; Cold Outreach matching
                </label>
              </div>

              {/* Modal Actions */}
              <div className="kb-modal-footer">
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(false)}
                  className="btn-secondary"
                  style={{ fontSize: "0.82rem" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ fontSize: "0.82rem" }}
                >
                  Save Project to MongoDB
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: GITHUB IMPORT */}
      {/* ============================================================ */}
      {isGithubModalOpen && (
        <div className="kb-modal-backdrop">
          <div className="kb-modal-card" style={{ maxWidth: "520px" }}>
            <div className="kb-modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <GithubIcon size={18} color="var(--accent-gold)" />
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-main)" }}>
                  Import README from GitHub
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsGithubModalOpen(false)}
                className="kb-close-btn"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleImportGithub} className="kb-modal-body">
              <p style={{ fontSize: "0.83rem", color: "var(--text-muted)", lineHeight: "1.55" }}>
                Paste any public GitHub repository URL. Sendora will auto-fetch the <code>README.md</code>, extract key technologies, and save it directly to your MongoDB Atlas knowledge base.
              </p>

              <div className="form-group" style={{ marginTop: "12px" }}>
                <label className="form-label">GitHub Repository URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://github.com/RahulPrasad-78/ShopNow"
                  value={githubRepoUrl}
                  onChange={(e) => setGithubRepoUrl(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="kb-modal-footer" style={{ marginTop: "16px" }}>
                <button
                  type="button"
                  onClick={() => setIsGithubModalOpen(false)}
                  className="btn-secondary"
                  style={{ fontSize: "0.82rem" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isImportingGithub}
                  className="btn-primary"
                  style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem" }}
                >
                  {isImportingGithub ? <Loader2 size={14} className="spin" /> : <Sparkles size={14} />}
                  <span>{isImportingGithub ? "Fetching README..." : "Fetch & Save"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
