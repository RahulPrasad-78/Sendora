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

// Behind Render/Vercel proxies, so req.ip (used by rate limiting) is the real client
app.set("trust proxy", 1);

// CORS_ORIGIN: comma-separated list of allowed frontend origins (e.g. your Vercel URL).
// Unset = allow all origins (fine for local dev only).
const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);
if (allowedOrigins.length === 0) {
  console.warn("Notice: CORS_ORIGIN is not set. Allowing requests from any origin.");
}
app.use(cors(allowedOrigins.length > 0 ? { origin: allowedOrigins } : undefined));
app.use(express.json({ limit: "15mb" }));

connectDB();

// Ensure DB connection on serverless warm starts
app.use(async (_req, _res, next) => {
  await connectDB();
  next();
});

// All endpoints live under /api (Vite dev proxy, Vercel rewrite and the frontend all use it)
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

app.use("/api", apiRouter);

// Global error handler — ensures no request ever returns an empty body
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  const status = err.status || err.statusCode || 500;
  const message = status >= 500 && process.env.NODE_ENV === "production"
    ? "Internal server error"
    : err.message || "Internal server error";
  res.status(status).json({ message });
});

const PORT = process.env.PORT || 7000;
if (!process.env.VERCEL && require.main === module) {
  app.listen(PORT, () => {
    console.log(`✅ Sendora backend running on http://localhost:${PORT}`);
  });
}

module.exports = app;
