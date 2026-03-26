import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import ConnectDb from "./config/db.js";

import resumeRoutes from "./routes/resumeRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  "http://localhost:5173",
  "https://resume-analyzer-seven-gamma.vercel.app",
  process.env.FRONTEND_URL,
  process.env.CORS_ORIGIN, 
]
  .filter(Boolean)
  .map((origin) => origin!.replace(/\/$/, ""));

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    const normalizedOrigin = origin.replace(/\/$/, "");

    if (allowedOrigins.includes(normalizedOrigin)) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));
app.use(express.json());


app.use("/api/resume", resumeRoutes);
app.use("/api/user", userRoutes);

app.get("/", (_req, res) => {
  res.json({ success: true, message: "Resume Helper API is running" });
});

const startServer = async () => {
  try {
    await ConnectDb();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    
  }
};

startServer();
