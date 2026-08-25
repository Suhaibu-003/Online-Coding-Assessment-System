import dotenv from "dotenv";
dotenv.config();


import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";
import otpRoutes from "./routes/otpRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";



const app = express();

const PORT = process.env.PORT || 5000;
const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .map((origin) => origin.replace(/\/+$/, ""))
  .filter(Boolean);
const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  const normalizedOrigin = origin.replace(/\/+$/, "");
  return allowedOrigins.includes(normalizedOrigin)
    || normalizedOrigin === "https://coding-assement-system.vercel.app"
    || /^https?:\/\/localhost(:\d+)?$/.test(normalizedOrigin);
};

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests and configured frontend origins.
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }
    return callback(new Error("CORS origin is not allowed"));
  },
  credentials: true
}));
app.use(express.json());

// Support both `/api/*` and legacy `/*` frontend route shapes.
// This keeps older deployments working while the frontend rollout catches up.
app.use("/auth", authRoutes);
app.use("/otp", otpRoutes);
app.use("/tests", testRoutes);
app.use("/submissions", submissionRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/submissions", submissionRoutes);

app.get("/", (req, res) => {
  res.send("OCA Backend Running ✅");
});

connectDB();
app.use(notFound);
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} in use, retrying in 1s...`);
    setTimeout(() => {
      server.close(() => {
        app.listen(PORT, () => console.log(`Server restarted on port ${PORT}`));
      });
    }, 1000);
  } else {
    throw err;
  }
});
