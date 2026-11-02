// Base URL of the Sendora backend. Set VITE_API_URL (e.g. https://your-backend.onrender.com/api)
// in production; locally it falls back to "/api", which the Vite dev proxy forwards to localhost.
export const API = (import.meta.env.VITE_API_URL || "/api").replace(/\/+$/, "");
