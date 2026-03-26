import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import ConnectDb from "./config/db.js";

import resumeRoutes from "./routes/resumeRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
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
