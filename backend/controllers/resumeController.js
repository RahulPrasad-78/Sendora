const TailoredResume = require("../models/TailoredResume");
const {
  buildTailoredResume,
  getKnowledgeBaseStatus,
  compileLatexToPdf,
  readBaseCls,
  readAllReadmes,
} = require("../services/resumeService");

// In-memory fallback if MongoDB is not connected
let memoryResumeStore = [];

const generateResume = async (req, res) => {
  try {
    const { jobDescription, projectCount } = req.body;

    if (!jobDescription || !jobDescription.trim()) {
      return res
        .status(400)
        .json({ message: "Job description is required to generate a resume." });
    }

    const tailoredData = await buildTailoredResume({ jobDescription, projectCount });

    const payload = {
      title: tailoredData.title,
      jobDescription,
      targetRole: tailoredData.targetRole,
      company: tailoredData.company,
      latexContent: tailoredData.latexContent,
      pdfBase64: tailoredData.pdfBase64,
      pdfFileName: tailoredData.pdfFileName,
      summary: tailoredData.summary,
      keySkills: tailoredData.keySkills,
      selectedProjects: tailoredData.selectedProjects,
      projectCount: tailoredData.projectCount || 2,
    };

    const { isOwnerAuthorized } = require("../middleware/authMiddleware");
    const isOwner = isOwnerAuthorized(req);

    let savedRecord = null;
    if (isOwner) {
      // Authenticated Owner: Persist to MongoDB permanently
      try {
        savedRecord = await TailoredResume.create(payload);
      } catch (dbErr) {
        console.warn("MongoDB write warning, using memory store for resume:", dbErr.message);
        savedRecord = {
          _id: "mem_resume_" + Date.now(),
          ...payload,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        memoryResumeStore.unshift(savedRecord);
      }
    } else {
      // Guest / Recruiter mode: Return generated PDF & LaTeX without polluting MongoDB
      savedRecord = {
        _id: "preview_" + Date.now(),
        ...payload,
        createdAt: new Date(),
        updatedAt: new Date(),
        isGuestPreview: true,
      };
    }

    return res.status(201).json({
      message: tailoredData.aiErrorMessage 
        ? tailoredData.aiErrorMessage 
        : isOwner 
          ? "Tailored resume generated and saved to MongoDB!" 
          : "Tailored resume generated in Viewer Mode (PDF preview ready; not saved to MongoDB database).",
      data: savedRecord,
      isOwner,
      isQuotaExceeded: Boolean(tailoredData.isQuotaExceeded),
      aiErrorMessage: tailoredData.aiErrorMessage || null,
    });
  } catch (error) {
    console.error("Error generating tailored resume:", error);
    return res.status(500).json({
      message: "Failed to generate tailored resume: " + error.message,
      error: error.message,
    });
  }
};

const getResumes = async (_req, res) => {
  try {
    let resumes = [];
    try {
      // Exclude heavy pdfBase64 from listing for fast responses
      resumes = await TailoredResume.find()
        .select("-pdfBase64")
        .sort({ createdAt: -1 })
        .limit(50);
    } catch {
      resumes = memoryResumeStore.map(({ pdfBase64: _pdfBase64, ...rest }) => rest);
    }

    return res.status(200).json(resumes);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch resumes",
      error: error.message,
    });
  }
};

const getResumeById = async (req, res) => {
  try {
    const { id } = req.params;
    let resume = null;

    try {
      resume = await TailoredResume.findById(id);
    } catch {
      resume = memoryResumeStore.find((r) => r._id === id);
    }

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    return res.status(200).json(resume);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const downloadResumePdf = async (req, res) => {
  try {
    const { id } = req.params;
    let resume = null;

    try {
      resume = await TailoredResume.findById(id);
    } catch {
      resume = memoryResumeStore.find((r) => r._id === id);
    }

    if (!resume || !resume.pdfBase64) {
      return res.status(404).json({
        message: "PDF preview is not available on this server. Direct PDF compilation requires local XeLaTeX/MiKTeX. You can copy the LaTeX code or download the .tex file directly.",
      });
    }

    const buffer = Buffer.from(resume.pdfBase64, "base64");
    const fileName = resume.pdfFileName || "Tailored_Resume.pdf";

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${fileName}"`
    );
    return res.send(buffer);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteResume = async (req, res) => {
  try {
    const { id } = req.params;

    try {
      await TailoredResume.findByIdAndDelete(id);
    } catch {
      memoryResumeStore = memoryResumeStore.filter((r) => r._id !== id);
    }

    return res.status(200).json({ message: "Resume deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getResumeStatus = async (_req, res) => {
  try {
    const status = await getKnowledgeBaseStatus();
    return res.status(200).json(status);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * PUT /api/resumes/:id
 * or POST /api/resumes/recompile
 * Compiles custom edited LaTeX code via XeLaTeX, updates PDF in MongoDB, and returns updated resume.
 */
const updateAndRecompileResume = async (req, res) => {
  try {
    const { id } = req.params;
    const { latexContent, title } = req.body;

    if (!latexContent || !latexContent.trim()) {
      return res.status(400).json({ message: "latexContent is required to recompile resume." });
    }

    // 1. Fetch active .cls definition and project readmes
    const baseCls = await readBaseCls();
    const readmes = await readAllReadmes();

    // 2. Compile updated LaTeX via XeLaTeX (graceful on cloud environments)
    let pdfBase64 = null;
    let compileNotice = null;
    try {
      const compiled = compileLatexToPdf(latexContent, baseCls);
      if (compiled && compiled.pdfBuffer) {
        pdfBase64 = compiled.pdfBuffer.toString("base64");
      }
    } catch (compileErr) {
      console.warn("XeLaTeX recompile notice:", compileErr.message);
      compileNotice = "LaTeX code saved successfully! (Direct PDF export is active when running locally with XeLaTeX/MiKTeX)";
    }

    // 3. Find existing resume (or create if draft without ID)
    let resume = null;
    if (id && id !== "draft") {
      try {
        resume = await TailoredResume.findById(id);
      } catch {
        resume = memoryResumeStore.find((r) => r._id === id);
      }
    }

    // Dynamically match projects from readmes
    const selectedProjects = [];
    if (readmes && typeof readmes === "object") {
      for (const key of Object.keys(readmes)) {
        const cleanName = key.replace(/\.md$/i, "").replace(/[-_]/g, " ").trim();
        const firstWord = cleanName.split(" ")[0];
        if (firstWord && firstWord.length > 2 && new RegExp(`\\b${firstWord}\\b`, "i").test(latexContent)) {
          if (!selectedProjects.includes(cleanName)) selectedProjects.push(cleanName);
        }
      }
    }
    if (selectedProjects.length === 0) {
      if (/ShopNow/i.test(latexContent)) selectedProjects.push("ShopNow E-Commerce");
      if (/Horizon/i.test(latexContent)) selectedProjects.push("Horizon LMS");
      if (/Sendora/i.test(latexContent)) selectedProjects.push("Sendora AI Outreach");
    }

    if (resume) {
      resume.latexContent = latexContent;
      if (pdfBase64) resume.pdfBase64 = pdfBase64;
      if (title && title.trim()) resume.title = title.trim();
      if (selectedProjects.length > 0) resume.selectedProjects = selectedProjects;
      try {
        await resume.save();
      } catch {
        const idx = memoryResumeStore.findIndex((r) => r._id === id);
        if (idx !== -1) {
          memoryResumeStore[idx] = {
            ...memoryResumeStore[idx],
            latexContent,
            pdfBase64: pdfBase64 || memoryResumeStore[idx].pdfBase64,
            title: resume.title,
            selectedProjects,
          };
          resume = memoryResumeStore[idx];
        }
      }
    } else {
      const payload = {
        title: title || "Custom Tailored Resume",
        jobDescription: "Custom tailored LaTeX resume",
        latexContent,
        pdfBase64,
        selectedProjects,
        keySkills: [],
      };
      try {
        resume = await TailoredResume.create(payload);
      } catch {
        resume = { _id: "mem_resume_" + Date.now(), ...payload, createdAt: new Date() };
        memoryResumeStore.unshift(resume);
      }
    }

    return res.status(200).json({
      message: compileNotice || "Resume recompiled with XeLaTeX and updated in MongoDB!",
      data: resume,
    });
  } catch (error) {
    console.error("Error recompiling resume:", error);
    return res.status(500).json({
      message: "XeLaTeX compilation failed: " + error.message,
      error: error.message,
    });
  }
};

module.exports = {
  generateResume,
  getResumes,
  getResumeById,
  downloadResumePdf,
  deleteResume,
  getResumeStatus,
  updateAndRecompileResume,
};
