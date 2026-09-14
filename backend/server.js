const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.resolve(__dirname, ".env") });
dotenv.config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const emailRoutes = require("./routes/emailRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const resumeRoutes = require("./routes/resumeRoutes");
const knowledgeRoutes = require("./routes/knowledgeRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

connectDB();

// Health check — lets frontend detect if backend is running
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/emails", emailRoutes);
app.use("/api/categorize", categoryRoutes);
app.use("/api/resumes", resumeRoutes);
app.use("/api/knowledge", knowledgeRoutes);

// Global error handler — ensures no request ever returns an empty body
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 7000;
app.listen(PORT, () => {
  console.log(`✅ Sendora backend running on http://localhost:${PORT}`);
});
