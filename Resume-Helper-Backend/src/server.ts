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
  'http://localhost:5173',
  'https://resume-analyzer-seven-gamma.vercel.app'  
]

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
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
