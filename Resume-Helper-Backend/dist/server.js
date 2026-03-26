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
ConnectDb();
app.use("/api/resume", resumeRoutes);
app.use("/api/user", userRoutes);
app.use((req, res, next) => {
    console.log("Incoming request:", req.method, req.url);
    next();
});
app.use((req, res, next) => {
    console.log("Incoming request:", req.method, req.url);
    next();
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
