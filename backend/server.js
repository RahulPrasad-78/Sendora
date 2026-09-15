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

// Ensure DB connection on serverless warm starts
app.use(async (_req, _res, next) => {
  await connectDB();
  next();
});

// Create an API router so endpoints respond whether accessed with or without /api prefix
const apiRouter = express.Router();

// Health check — lets frontend detect if backend is running
apiRouter.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

apiRouter.use("/auth", authRoutes);
apiRouter.use("/emails", emailRoutes);
apiRouter.use("/categorize", categoryRoutes);
apiRouter.use("/resumes", resumeRoutes);
apiRouter.use("/knowledge", knowledgeRoutes);

// Mount router on BOTH "/api" AND "/" for seamless compatibility with local Vite proxy & Vercel rewrites
app.use("/api", apiRouter);
app.use("/", apiRouter);

// Global error handler — ensures no request ever returns an empty body
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 7000;
if (!process.env.VERCEL && require.main === module) {
  app.listen(PORT, () => {
    console.log(`✅ Sendora backend running on http://localhost:${PORT}`);
  });
}

module.exports = app;
