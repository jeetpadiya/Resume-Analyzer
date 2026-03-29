// routes.ts
import express from "express";
import { getResumeHistory, uploadResume,resumeDelete,ResumeEdit } from '../controllers/resumeController.js';
import { analyzeResume, getResumeAnalysis } from "../controllers/analysisController.js";
import { authMiddleware } from '../middlewares/auth.js'
import { upload } from "../middlewares/upload.js";

const router = express.Router();

router.post("/upload", authMiddleware,upload.single('file'),uploadResume);
router.post("/analyze", authMiddleware, analyzeResume);
router.get("/history", authMiddleware, getResumeHistory);
router.get("/:resumeId/analysis", authMiddleware, getResumeAnalysis);
router.delete("/:resumeId", authMiddleware, resumeDelete);
router.put("/:resumeId", authMiddleware, ResumeEdit); // New route for updating a resume
export default router;
