const fs = require("fs");
const path = require("path");
const ProjectReadme = require("../models/ProjectReadme");
const MasterResume = require("../models/MasterResume");

const KNOWLEDGE_BASE_DIR = path.join(__dirname, "..", "knowledge-base");
const READMES_DIR = path.join(KNOWLEDGE_BASE_DIR, "readmes");

const { DEFAULT_MASTER_LATEX, DEFAULT_CLS_CONTENT, DEFAULT_PROJECT_SEEDS } = require("../services/defaultTemplates");

// In-memory fallback if MongoDB is offline
let memoryProjects = [];
let memoryMasterResume = null;

/**
 * Seed default projects into MongoDB if database has 0 projects.
 */
async function autoSeedProjects() {
  const seeded = [];
  
  // Try disk first if files exist
  if (fs.existsSync(READMES_DIR)) {
    try {
      const files = fs
        .readdirSync(READMES_DIR)
        .filter((f) => f.toLowerCase().endsWith(".md"));

      for (const file of files) {
        const rawContent = fs.readFileSync(path.join(READMES_DIR, file), "utf-8");
        const rawName = file.replace(/-?readme\.md$/i, "").replace(/\.md$/i, "");
        const title = rawName.charAt(0).toUpperCase() + rawName.slice(1);

        const techStack = [];
        const techKeywords = [
          "React", "Node.js", "Express", "MongoDB", "PostgreSQL", "TailwindCSS",
          "TypeScript", "JavaScript", "Python", "Redux", "Docker", "AWS", "Next.js",
          "GraphQL", "Gemini", "OpenAI", "Socket.io", "Redis", "Vite"
        ];
        for (const kw of techKeywords) {
          if (new RegExp(`\\b${kw}\\b`, "i").test(rawContent)) {
            techStack.push(kw);
          }
        }

        const payload = {
          title,
          slug: title.toLowerCase().replace(/[^a-z0-9]/g, "-"),
          tagline: `Full-stack project: ${title}`,
          techStack: techStack.slice(0, 8),
          content: rawContent,
          repoUrl: `https://github.com/RahulPrasad-78/${title}`,
          isFeatured: true,
          source: "disk_seeded",
        };

        try {
          const created = await ProjectReadme.create(payload);
          seeded.push(created);
        } catch (err) {
          seeded.push({ _id: "mem_" + Date.now() + Math.random(), ...payload });
        }
      }
    } catch {}
  }

  // If no disk files or 0 seeded, use DEFAULT_PROJECT_SEEDS
  if (seeded.length === 0) {
    for (const seed of DEFAULT_PROJECT_SEEDS) {
      try {
        const created = await ProjectReadme.create(seed);
        seeded.push(created);
      } catch (err) {
        seeded.push({ _id: "mem_" + Date.now() + Math.random(), ...seed });
      }
    }
  }

  return seeded;
}

/**
 * GET /api/knowledge/projects
 * Fetches all project READMEs from MongoDB (with auto-seed from disk if empty).
 */
const getProjects = async (req, res) => {
  try {
    let projects = [];
    try {
      projects = await ProjectReadme.find().sort({ isFeatured: -1, createdAt: -1 });
      if (projects.length === 0) {
        projects = await autoSeedProjects();
      }
    } catch (dbErr) {
      if (memoryProjects.length === 0) {
        memoryProjects = await autoSeedProjects();
      }
      projects = memoryProjects;
    }

    return res.status(200).json(projects);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch projects", error: error.message });
  }
};

/**
 * POST /api/knowledge/projects
 * Creates a new project README in MongoDB.
 */
const createProject = async (req, res) => {
  try {
    const { title, tagline, techStack, content, repoUrl, liveUrl, isFeatured, source } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Project title and content are required" });
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const payload = {
      title: title.trim(),
      slug,
      tagline: tagline ? tagline.trim() : "",
      techStack: Array.isArray(techStack) ? techStack : (techStack || "").split(",").map(s => s.trim()).filter(Boolean),
      content,
      repoUrl: (repoUrl || "").trim(),
      liveUrl: (liveUrl || "").trim(),
      isFeatured: isFeatured !== false,
      source: source || "manual",
    };

    let saved = null;
    try {
      saved = await ProjectReadme.create(payload);
    } catch (dbErr) {
      saved = { _id: "mem_" + Date.now(), ...payload, createdAt: new Date(), updatedAt: new Date() };
      memoryProjects.unshift(saved);
    }

    return res.status(201).json({ message: "Project README saved successfully to MongoDB!", project: saved });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create project", error: error.message });
  }
};

/**
 * PUT /api/knowledge/projects/:id
 * Updates an existing project README in MongoDB.
 */
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, tagline, techStack, content, repoUrl, liveUrl, isFeatured } = req.body;

    const updateData = {};
    if (title !== undefined) {
      updateData.title = title.trim();
      updateData.slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    }
    if (tagline !== undefined) updateData.tagline = tagline.trim();
    if (techStack !== undefined) {
      updateData.techStack = Array.isArray(techStack) ? techStack : techStack.split(",").map(s => s.trim()).filter(Boolean);
    }
    if (content !== undefined) updateData.content = content;
    if (repoUrl !== undefined) updateData.repoUrl = repoUrl.trim();
    if (liveUrl !== undefined) updateData.liveUrl = liveUrl.trim();
    if (isFeatured !== undefined) updateData.isFeatured = Boolean(isFeatured);

    try {
      const updated = await ProjectReadme.findByIdAndUpdate(id, updateData, { new: true });
      if (updated) return res.status(200).json({ message: "Project updated", project: updated });
    } catch (dbErr) {
      const idx = memoryProjects.findIndex(p => p._id === id);
      if (idx !== -1) {
        memoryProjects[idx] = { ...memoryProjects[idx], ...updateData, updatedAt: new Date() };
        return res.status(200).json({ message: "Project updated", project: memoryProjects[idx] });
      }
    }

    return res.status(404).json({ message: "Project not found" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update project", error: error.message });
  }
};

/**
 * DELETE /api/knowledge/projects/:id
 * Removes a project README from MongoDB.
 */
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    try {
      await ProjectReadme.findByIdAndDelete(id);
    } catch (dbErr) {
      memoryProjects = memoryProjects.filter(p => p._id !== id);
    }
    return res.status(200).json({ message: "Project removed successfully from MongoDB" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete project", error: error.message });
  }
};

/**
 * POST /api/knowledge/projects/github-import
 * Ingests a project README directly from a GitHub repository URL.
 */
const importFromGitHub = async (req, res) => {
  try {
    const { repoUrl, autoSave = true } = req.body;

    if (!repoUrl) {
      return res.status(400).json({ message: "repoUrl is required (e.g. https://github.com/username/repo)" });
    }

    const cleanUrl = repoUrl.trim().replace(/\/$/, "");
    const match = cleanUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/i);
    if (!match) {
      return res.status(400).json({ message: "Invalid GitHub repository URL" });
    }

    const [, owner, repo] = match;
    const branches = ["main", "master"];
    let content = null;
    let fetchedBranch = "";

    for (const b of branches) {
      const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${b}/README.md`;
      try {
        const response = await fetch(rawUrl);
        if (response.ok) {
          content = await response.text();
          fetchedBranch = b;
          break;
        }
      } catch (fErr) {
        // try next
      }
    }

    if (!content) {
      return res.status(404).json({ message: `Could not find README.md in repository '${owner}/${repo}' on main or master branches.` });
    }

    const title = repo.replace(/[-_]/g, " ").replace(/\b\w/g, l => l.toUpperCase());
    const techStack = [];
    const techKeywords = [
      "React", "Node.js", "Express", "MongoDB", "PostgreSQL", "TailwindCSS",
      "TypeScript", "JavaScript", "Python", "Redux", "Docker", "AWS", "Next.js",
      "GraphQL", "Gemini", "OpenAI", "Socket.io", "Redis", "Vite"
    ];
    for (const kw of techKeywords) {
      if (new RegExp(`\\b${kw}\\b`, "i").test(content)) {
        techStack.push(kw);
      }
    }

    const payload = {
      title,
      slug: repo.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      tagline: `Imported from ${owner}/${repo} (${fetchedBranch})`,
      techStack: techStack.slice(0, 8),
      content,
      repoUrl: `https://github.com/${owner}/${repo}`,
      isFeatured: true,
      source: "github_import",
    };

    if (autoSave) {
      let saved = null;
      try {
        saved = await ProjectReadme.create(payload);
      } catch (dbErr) {
        saved = { _id: "mem_" + Date.now(), ...payload, createdAt: new Date() };
        memoryProjects.unshift(saved);
      }
      return res.status(201).json({ message: `Successfully imported ${title} from GitHub!`, project: saved });
    }

    return res.status(200).json({ message: "Fetched README from GitHub", preview: payload });
  } catch (error) {
    return res.status(500).json({ message: "GitHub import failed: " + error.message });
  }
};

/**
 * GET /api/knowledge/master-resume
 * Retrieves the master LaTeX resume template from MongoDB (with disk seed if empty).
 */
const getMasterResume = async (req, res) => {
  try {
    let master = null;
    try {
      master = await MasterResume.findOne({ isDefault: true });
    } catch (dbErr) {
      master = memoryMasterResume;
    }

    const clsPath = path.join(KNOWLEDGE_BASE_DIR, "kyvernitis-resume.cls");
    let diskClsContent = "";
    if (fs.existsSync(clsPath)) {
      try {
        diskClsContent = fs.readFileSync(clsPath, "utf-8");
      } catch {}
    }
    if (!diskClsContent) {
      diskClsContent = DEFAULT_CLS_CONTENT;
    }

    if (!master) {
      const resumePath = path.join(KNOWLEDGE_BASE_DIR, "resume.tex");
      let diskContent = "";
      if (fs.existsSync(resumePath)) {
        try {
          diskContent = fs.readFileSync(resumePath, "utf-8");
        } catch {}
      }
      if (!diskContent) {
        diskContent = DEFAULT_MASTER_LATEX;
      }

      const payload = {
        title: "Master ATS LaTeX Resume",
        latexContent: diskContent,
        clsContent: diskClsContent,
        isDefault: true,
        version: 1,
        notes: "Master ATS template for XeLaTeX compilation",
      };

      try {
        master = await MasterResume.create(payload);
      } catch (dbErr) {
        master = { _id: "mem_master", ...payload, updatedAt: new Date() };
        memoryMasterResume = master;
      }
    } else if (!master.clsContent || !master.clsContent.trim()) {
      // Auto-populate clsContent if previously empty
      try {
        master.clsContent = diskClsContent;
        await master.save();
      } catch (saveErr) {
        master.clsContent = diskClsContent;
      }
    }

    return res.status(200).json(master);
  } catch (error) {
    return res.status(500).json({ message: "Failed to get master resume", error: error.message });
  }
};

/**
 * POST /api/knowledge/master-resume
 * Updates the master LaTeX resume in MongoDB.
 */
const saveMasterResume = async (req, res) => {
  try {
    const { latexContent, clsContent, title, notes } = req.body;

    if (!latexContent || !latexContent.trim()) {
      return res.status(400).json({ message: "latexContent is required" });
    }

    const updateFields = {
      latexContent,
      title: title || "Master ATS LaTeX Resume",
      notes: notes || "",
    };

    if (typeof clsContent === "string" && clsContent.trim()) {
      updateFields.clsContent = clsContent;
    }

    let updated = null;
    try {
      updated = await MasterResume.findOneAndUpdate(
        { isDefault: true },
        updateFields,
        { upsert: true, new: true }
      );
    } catch (dbErr) {
      memoryMasterResume = {
        _id: "mem_master",
        ...updateFields,
        clsContent: updateFields.clsContent || (memoryMasterResume && memoryMasterResume.clsContent) || DEFAULT_CLS_CONTENT,
        isDefault: true,
        updatedAt: new Date(),
      };
      updated = memoryMasterResume;
    }

    return res.status(200).json({ message: "Master LaTeX resume and class saved to MongoDB!", masterResume: updated });
  } catch (error) {
    return res.status(500).json({ message: "Failed to save master resume", error: error.message });
  }
};

/**
 * POST /api/knowledge/master-resume/reset
 * Resets the master LaTeX resume in MongoDB back to default template
 */
const resetMasterResumeToDisk = async (req, res) => {
  try {
    const resumePath = path.join(KNOWLEDGE_BASE_DIR, "resume.tex");
    let defaultContent = DEFAULT_MASTER_LATEX;
    if (fs.existsSync(resumePath)) {
      try {
        defaultContent = fs.readFileSync(resumePath, "utf-8");
      } catch {}
    }

    const clsPath = path.join(KNOWLEDGE_BASE_DIR, "kyvernitis-resume.cls");
    let defaultCls = DEFAULT_CLS_CONTENT;
    if (fs.existsSync(clsPath)) {
      try {
        defaultCls = fs.readFileSync(clsPath, "utf-8");
      } catch {}
    }

    const resetFields = {
      latexContent: defaultContent,
      clsContent: defaultCls,
      title: "Master ATS LaTeX Resume (Default Reset)",
      notes: "Reset to default template on " + new Date().toLocaleString(),
    };

    let updated = null;
    try {
      updated = await MasterResume.findOneAndUpdate(
        { isDefault: true },
        resetFields,
        { upsert: true, new: true }
      );
    } catch (dbErr) {
      memoryMasterResume = {
        _id: "mem_master",
        ...resetFields,
        isDefault: true,
        updatedAt: new Date(),
      };
      updated = memoryMasterResume;
    }

    return res.status(200).json({ message: "Reset master resume and class to default template", masterResume: updated });
  } catch (error) {
    return res.status(500).json({ message: "Reset failed: " + error.message });
  }
};

module.exports = {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  importFromGitHub,
  getMasterResume,
  saveMasterResume,
  resetMasterResumeToDisk,
};

