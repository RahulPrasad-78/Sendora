const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execSync } = require("child_process");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const KNOWLEDGE_BASE_DIR = path.join(__dirname, "..", "knowledge-base");
const READMES_DIR = path.join(KNOWLEDGE_BASE_DIR, "readmes");
const TEMP_DIR = path.join(__dirname, "..", "temp");

// Ensure required directories exist
[KNOWLEDGE_BASE_DIR, TEMP_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Windows MiKTeX PATH autodetect
const possibleMiktexPaths = [
  path.join(
    process.env.LOCALAPPDATA || "C:\\Users\\ravis\\AppData\\Local",
    "Programs",
    "MiKTeX",
    "miktex",
    "bin",
    "x64"
  ),
  "C:\\Program Files\\MiKTeX\\miktex\\bin\\x64",
];
for (const p of possibleMiktexPaths) {
  if (fs.existsSync(p) && !(process.env.PATH || "").includes(p)) {
    process.env.PATH = `${p};${process.env.PATH || ""}`;
  }
}

const mongoose = require("mongoose");
const ProjectReadme = require("../models/ProjectReadme");
const MasterResume = require("../models/MasterResume");
const { DEFAULT_MASTER_LATEX, DEFAULT_CLS_CONTENT, DEFAULT_PROJECT_SEEDS } = require("./defaultTemplates");

/**
 * Reads the base master resume LaTeX: checks MongoDB MasterResume first, falls back to disk resume.tex or default template.
 */
async function readBaseResume() {
  try {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      const dbResume = await MasterResume.findOne({ isDefault: true });
      if (dbResume && dbResume.latexContent && dbResume.latexContent.trim()) {
        return dbResume.latexContent;
      }
    }
  } catch (err) {
    console.warn("MongoDB read warning in readBaseResume, falling back:", err.message);
  }

  const resumePath = path.join(KNOWLEDGE_BASE_DIR, "resume.tex");
  if (fs.existsSync(resumePath)) {
    return fs.readFileSync(resumePath, "utf-8");
  }

  return DEFAULT_MASTER_LATEX;
}

/**
 * Reads the base master resume class (.cls): checks MongoDB MasterResume first, falls back to disk kyvernitis-resume.cls or default template.
 */
async function readBaseCls() {
  try {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      const dbResume = await MasterResume.findOne({ isDefault: true });
      if (dbResume && dbResume.clsContent && dbResume.clsContent.trim()) {
        return dbResume.clsContent;
      }
    }
  } catch (err) {
    console.warn("MongoDB read warning in readBaseCls, falling back:", err.message);
  }

  const clsPath = path.join(KNOWLEDGE_BASE_DIR, "kyvernitis-resume.cls");
  if (fs.existsSync(clsPath)) {
    return fs.readFileSync(clsPath, "utf-8");
  }

  return DEFAULT_CLS_CONTENT;
}

/**
 * Reads all project README markdown files: checks MongoDB ProjectReadme first, falls back to disk readmes or default seeds.
 */
async function readAllReadmes() {
  try {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      const dbProjects = await ProjectReadme.find({ isFeatured: { $ne: false } });
      if (dbProjects && dbProjects.length > 0) {
        const contents = {};
        for (const p of dbProjects) {
          const key = `${p.title}.md`;
          contents[key] = p.content;
        }
        return contents;
      }
    }
  } catch (err) {
    console.warn("MongoDB read warning in readAllReadmes, falling back:", err.message);
  }

  if (fs.existsSync(READMES_DIR)) {
    const files = fs
      .readdirSync(READMES_DIR)
      .filter((f) => f.toLowerCase().endsWith(".md"));

    if (files.length > 0) {
      const contents = {};
      for (const file of files) {
        contents[file] = fs.readFileSync(path.join(READMES_DIR, file), "utf-8");
      }
      return contents;
    }
  }

  // Fallback to default project seeds
  const defaultContents = {};
  for (const p of DEFAULT_PROJECT_SEEDS) {
    defaultContents[`${p.title}.md`] = p.content;
  }
  return defaultContents;
}

/**
 * Returns knowledge base stats and tool status (MongoDB + local disk).
 */
async function getKnowledgeBaseStatus() {
  let dbProjectCount = 0;
  let dbResumeLoaded = false;
  let dbClsLoaded = false;

  try {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      dbProjectCount = await ProjectReadme.countDocuments();
      const defaultResume = await MasterResume.findOne({ isDefault: true });
      dbResumeLoaded = Boolean(defaultResume);
      dbClsLoaded = Boolean(defaultResume && defaultResume.clsContent && defaultResume.clsContent.trim());
    }
  } catch (err) {
    // MongoDB offline
  }

  const resumeExists = fs.existsSync(path.join(KNOWLEDGE_BASE_DIR, "resume.tex"));
  const clsExists = fs.existsSync(
    path.join(KNOWLEDGE_BASE_DIR, "kyvernitis-resume.cls")
  );

  let readmeFiles = [];
  if (fs.existsSync(READMES_DIR)) {
    readmeFiles = fs
      .readdirSync(READMES_DIR)
      .filter((f) => f.toLowerCase().endsWith(".md"));
  }

  let xelatexInstalled = false;
  try {
    execSync("xelatex --version", { stdio: "pipe", timeout: 5000 });
    xelatexInstalled = true;
  } catch {
    xelatexInstalled = false;
  }

  return {
    resumeLoaded: dbResumeLoaded || resumeExists || Boolean(DEFAULT_MASTER_LATEX),
    dbResumeLoaded,
    clsLoaded: dbClsLoaded || clsExists || Boolean(DEFAULT_CLS_CONTENT),
    dbClsLoaded,
    clsSource: dbClsLoaded ? "mongodb" : (clsExists ? "disk" : "default_seed"),
    readmeCount: dbProjectCount > 0 ? dbProjectCount : (readmeFiles.length || DEFAULT_PROJECT_SEEDS.length),
    dbProjectCount,
    readmeFiles,
    xelatexInstalled,
    apiKeyConfigured: Boolean(process.env.GEMINI_API_KEY),
  };
}

/**
 * System instruction prompt for Gemini LaTeX ATS Resume Writer.
 */
function buildSystemInstruction(projectCount = 2) {
  const countNum = Math.max(1, Math.min(5, parseInt(projectCount, 10) || 2));
  const countText = `${countNum} project${countNum > 1 ? "s" : ""}`;
  return `You are an expert ATS (Applicant Tracking System) resume writer and LaTeX specialist.
Your task is to tailor a base LaTeX resume to a specific job description by selecting the most relevant projects and optimizing content for ATS compatibility.

STRICT RULES:
1. FORMAT PRESERVATION: The LaTeX structure, formatting commands, document class (kyvernitis-resume), packages, and overall layout must remain EXACTLY the same as the base resume. Do NOT remove or modify LaTeX environments, font choices, or structure. Only adapt the text content.
2. PROJECT SELECTION: Analyze the job description. Select EXACTLY ${countText} from the provided README files and base resume that best demonstrate the target technologies. Do NOT include more or fewer than ${countNum} project${countNum > 1 ? "s" : ""}. Highlight real metrics, architectures, and endpoints.
3. SKILLS REORDERING: Prioritize skills in the \\sectiontable{Technical skills} that match the target JD.
4. BULLET POINT OPTIMIZATION: Tailor bullet points to emphasize relevant achievements, APIs, frameworks, and tools. Keep tone professional and action-oriented.
5. SINGLE PAGE REQUIREMENT: Keep the resume strictly to a single page.
6. OUTPUT FORMAT: Output ONLY raw compilable LaTeX. Do NOT wrap in markdown code blocks (\`\`\`latex or \`\`\`). The output must start with \\documentclass and end with \\end{document}.`;
}

/**
 * Calls Gemini to generate tailored LaTeX code.
 */
async function generateTailoredLatex(jobDescription, readmeContents, baseResumeLatex, projectCount = 2) {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("No GEMINI_API_KEY set, using base resume as fallback");
    return {
      latex: baseResumeLatex,
      isQuotaExceeded: false,
      aiErrorMessage: "No GEMINI_API_KEY set. Used base master resume template.",
    };
  }

  const countNum = Math.max(1, Math.min(5, parseInt(projectCount, 10) || 2));
  const countText = `${countNum} project${countNum > 1 ? "s" : ""}`;

  let readmeSection = "";
  for (const [filename, content] of Object.entries(readmeContents)) {
    readmeSection += `\n--- ${filename} ---\n${content}\n`;
  }

  const prompt = `## TARGET JOB DESCRIPTION:
${jobDescription}

## USER PROJECT COUNT REQUIREMENT:
The user explicitly requested to include EXACTLY ${countText} in this resume. Select the top ${countNum} most relevant projects from the README files below that best match the target JD. Do NOT include more or fewer than ${countNum} project(s).

## PROJECT README FILES:
${readmeSection}

## BASE RESUME (LaTeX) — Preserve this exact styling, font, and document structure:
${baseResumeLatex}

Now tailor this resume specifically for the job description above with EXACTLY ${countText}. Output ONLY raw compilable LaTeX starting with \\documentclass and ending with \\end{document}.`;

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
      systemInstruction: buildSystemInstruction(countNum),
      generationConfig: {
        temperature: 0.3,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 8192,
      },
    });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    let text = result.response.text();
    text = text.replace(/^```(?:latex|tex)?\s*\n?/i, "");
    text = text.replace(/\n?```\s*$/i, "");
    text = text.trim();

    if (!text.includes("\\documentclass") || !text.includes("\\end{document}")) {
      console.warn("AI output missing \\documentclass or \\end{document}. Falling back to base resume.");
      return {
        latex: baseResumeLatex,
        isQuotaExceeded: false,
        aiErrorMessage: "AI response was incomplete. Used base master resume fallback.",
      };
    }

    return {
      latex: text,
      isQuotaExceeded: false,
      aiErrorMessage: null,
    };
  } catch (err) {
    console.error("Error generating resume with Gemini:", err.message);
    const isQuota = /429|quota|RESOURCE_EXHAUSTED/i.test(err.message);
    const isBusy = /503/i.test(err.message);
    return {
      latex: baseResumeLatex,
      isQuotaExceeded: isQuota,
      aiErrorMessage: isQuota
        ? "Google Gemini API daily quota or rate limit exceeded (429). Used base master resume template fallback."
        : (isBusy ? "Google Gemini API temporarily busy (503). Used base master resume template fallback." : `Gemini notice: ${err.message}`),
    };
  }
}

/**
 * Compiles a LaTeX string to a PDF buffer using XeLaTeX.
 * Dynamically provides the .cls definition from MongoDB, override, disk, or default template.
 */
function compileLatexToPdf(latexContent, clsContentOverride) {
  const jobId = crypto.randomUUID();
  const texPath = path.join(TEMP_DIR, `${jobId}.tex`);

  // Detect documentclass name (e.g. \documentclass[]{kyvernitis-resume} -> kyvernitis-resume.cls)
  const docClassMatch = latexContent.match(/\\documentclass(?:\[[^\]]*\])?\{([^}]+)\}/);
  const clsFileName = docClassMatch && docClassMatch[1] ? `${docClassMatch[1].trim()}.cls` : "kyvernitis-resume.cls";
  const clsDst = path.join(TEMP_DIR, clsFileName);

  // Write cls definition directly into compilation directory
  let clsText = clsContentOverride;
  if (!clsText) {
    const clsSrc = path.join(KNOWLEDGE_BASE_DIR, clsFileName);
    if (fs.existsSync(clsSrc)) {
      clsText = fs.readFileSync(clsSrc, "utf-8");
    } else {
      clsText = DEFAULT_CLS_CONTENT;
    }
  }
  fs.writeFileSync(clsDst, clsText, "utf-8");

  fs.writeFileSync(texPath, latexContent, "utf-8");

  try {
    const cmd = `xelatex -interaction=nonstopmode --enable-installer -output-directory="${TEMP_DIR}" "${texPath}"`;
    execSync(cmd, { cwd: TEMP_DIR, timeout: 60000, stdio: "pipe" });

    const pdfPath = path.join(TEMP_DIR, `${jobId}.pdf`);
    if (!fs.existsSync(pdfPath)) {
      throw new Error("PDF file was not produced by XeLaTeX compiler.");
    }

    const pdfBuffer = fs.readFileSync(pdfPath);

    // Clean up temp files asynchronously
    setTimeout(() => {
      cleanupJobFiles(jobId);
    }, 4000);

    return { pdfBuffer, jobId };
  } catch (err) {
    // Attempt to extract helpful error from log file
    const logPath = path.join(TEMP_DIR, `${jobId}.log`);
    let logSnippet = err.message;
    if (fs.existsSync(logPath)) {
      const logContent = fs.readFileSync(logPath, "utf-8");
      const errLines = logContent
        .split("\n")
        .filter((l) => l.startsWith("!") || l.includes("Error"))
        .slice(0, 8)
        .join("\n");
      if (errLines) logSnippet = errLines;
    }

    cleanupJobFiles(jobId);
    throw new Error(`XeLaTeX compilation failed: ${logSnippet}`);
  }
}

function cleanupJobFiles(jobId) {
  const exts = [
    ".tex",
    ".pdf",
    ".aux",
    ".log",
    ".out",
    ".fls",
    ".fdb_latexmk",
    ".synctex.gz",
    ".xdv",
  ];
  for (const ext of exts) {
    const p = path.join(TEMP_DIR, `${jobId}${ext}`);
    if (fs.existsSync(p)) {
      try {
        fs.unlinkSync(p);
      } catch {}
    }
  }
}

/**
 * Extracts metadata from job description and tailored LaTeX.
 */
function extractResumeMeta(jobDescription, latexContent, knownReadmes = {}) {
  let targetRole = "Software Engineer";
  let company = "";

  // Try to extract role from common job description patterns
  const jd = jobDescription || "";
  const lines = jd.split("\n").map((l) => l.trim()).filter(Boolean);

  // First check first non-empty line (often the job title)
  if (lines[0] && lines[0].length < 60 && /[A-Z]/.test(lines[0])) {
    targetRole = lines[0].replace(/^(job title|role|position|title)\s*[:\-]?\s*/i, "").trim();
  }

  // Fall back to regex patterns in full text
  if (targetRole === "Software Engineer") {
    const roleMatch = jd.match(
      /(?:looking for|role|position|title|seeking an?|hiring an?)\s+([A-Za-z0-9\s/+#.-]{3,40})(?:\s+at|\s+to|\s+with|\n|\.)/i
    );
    if (roleMatch && roleMatch[1]) {
      targetRole = roleMatch[1].trim();
    }
  }

  // Clean up targetRole — remove trailing junk
  targetRole = targetRole.replace(/[^a-zA-Z0-9\s+#./&-]/g, "").trim().substring(0, 50);
  if (!targetRole) targetRole = "Software Engineer";

  const companyMatch = jd.match(
    /(?:at|with|join)\s+([A-Z][A-Za-z0-9&.-]+(?:\s+[A-Z][A-Za-z0-9&.-]+)?)/
  );
  if (companyMatch && companyMatch[1]) {
    company = companyMatch[1].trim();
  }

  const skills = [];
  const commonTech = [
    "React",
    "Node.js",
    "TypeScript",
    "JavaScript",
    "MongoDB",
    "Express",
    "ASP.NET Core",
    "C#",
    "Python",
    "PostgreSQL",
    "Docker",
    "AWS",
    "Azure",
    "Redux",
    "REST APIs",
    "Microservices",
  ];
  for (const tech of commonTech) {
    if (new RegExp(`\\b${tech}\\b`, "i").test(jd)) {
      skills.push(tech);
    }
  }

  const selectedProjects = [];
  // Dynamically match project titles from known readmes
  if (knownReadmes && typeof knownReadmes === "object") {
    for (const key of Object.keys(knownReadmes)) {
      const cleanName = key.replace(/\.md$/i, "").replace(/[-_]/g, " ").trim();
      const firstWord = cleanName.split(" ")[0];
      if (firstWord && firstWord.length > 2 && new RegExp(`\\b${firstWord}\\b`, "i").test(latexContent)) {
        if (!selectedProjects.includes(cleanName)) {
          selectedProjects.push(cleanName);
        }
      }
    }
  }
  if (selectedProjects.length === 0) {
    if (/ShopNow/i.test(latexContent)) selectedProjects.push("ShopNow E-Commerce");
    if (/Horizon/i.test(latexContent)) selectedProjects.push("Horizon LMS");
    if (/Sendora/i.test(latexContent)) selectedProjects.push("Sendora AI Outreach");
  }

  // Human-readable title and filename
  const titleBase = company ? `${targetRole} - ${company}` : `${targetRole} Resume`;
  // PDF filename: "Python Developer Resume.pdf" — readable, no underscores
  const pdfFileName = `${targetRole} Resume.pdf`;

  return {
    targetRole,
    company,
    keySkills: skills.slice(0, 8),
    selectedProjects,
    title: titleBase,
    pdfFileName,
    summary: `Tailored for ${targetRole}${company ? ` at ${company}` : ""} highlighting ${
      skills.slice(0, 4).join(", ") || "core technical stack"
    }.`,
  };
}

/**
 * High-level function: Tailors resume, compiles to PDF, and returns all data.
 */
async function buildTailoredResume({ jobDescription, projectCount = 2 }) {
  if (!jobDescription || !jobDescription.trim()) {
    throw new Error("Job description is required to tailor resume.");
  }

  const numProjects = Math.max(1, Math.min(5, parseInt(projectCount, 10) || 2));

  const baseResume = await readBaseResume();
  const baseCls = await readBaseCls();
  const readmes = await readAllReadmes();

  const { latex: tailoredLatex, isQuotaExceeded, aiErrorMessage } = await generateTailoredLatex(
    jobDescription,
    readmes,
    baseResume,
    numProjects
  );

  const { pdfBuffer } = compileLatexToPdf(tailoredLatex, baseCls);
  const pdfBase64 = pdfBuffer.toString("base64");

  const meta = extractResumeMeta(jobDescription, tailoredLatex, readmes);

  return {
    latexContent: tailoredLatex,
    pdfBuffer,
    pdfBase64,
    projectCount: numProjects,
    isQuotaExceeded: Boolean(isQuotaExceeded),
    aiErrorMessage: aiErrorMessage || null,
    ...meta,
  };
}

module.exports = {
  readBaseResume,
  readBaseCls,
  readAllReadmes,
  getKnowledgeBaseStatus,
  generateTailoredLatex,
  compileLatexToPdf,
  buildTailoredResume,
};
