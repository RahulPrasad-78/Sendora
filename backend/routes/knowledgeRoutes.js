const express = require("express");
const router = express.Router();
const {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  importFromGitHub,
  getMasterResume,
  saveMasterResume,
  resetMasterResumeToDisk,
} = require("../controllers/knowledgeController");
const { getKnowledgeBaseStatus } = require("../services/resumeService");
const { requireOwner } = require("../middleware/authMiddleware");

// Project README routes
router.get("/projects", getProjects);
router.post("/projects", requireOwner, createProject);
router.put("/projects/:id", requireOwner, updateProject);
router.delete("/projects/:id", requireOwner, deleteProject);
router.post("/projects/github-import", requireOwner, importFromGitHub);

// Master LaTeX Resume routes
router.get("/master-resume", getMasterResume);
router.post("/master-resume", requireOwner, saveMasterResume);
router.post("/master-resume/reset", requireOwner, resetMasterResumeToDisk);

// Status route
router.get("/status", async (_req, res) => {
  try {
    const status = await getKnowledgeBaseStatus();
    res.status(200).json(status);
  } catch (error) {
    res.status(500).json({ message: "Failed to check status", error: error.message });
  }
});

module.exports = router;

