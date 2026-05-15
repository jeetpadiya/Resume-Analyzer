// routes.ts
import express from "express";
import { getResumeHistory, uploadResume,resumeDelete,ResumeEdit } from '../controllers/resumeController.js';
import { analyzeResume, getResumeAnalysis } from "../controllers/analysisController.js";
import { generateCoverLetter, improveResume } from "../controllers/aiController.js";
import { authMiddleware } from '../middlewares/auth.js'
import { upload } from "../middlewares/upload.js";
import { validateRequest } from '../middlewares/validateRequest.js';
import { aiFeatureSchema, analyzeResumeSchema } from '../validators/resumeValidators.js';

const router = express.Router();

router.post("/upload", authMiddleware,upload.single('file'),uploadResume);
router.post("/analyze", authMiddleware, validateRequest(analyzeResumeSchema), analyzeResume);
router.post("/generate-cover-letter", authMiddleware, validateRequest(aiFeatureSchema), generateCoverLetter);
router.post("/improve-resume", authMiddleware, validateRequest(aiFeatureSchema), improveResume);
router.get("/history", authMiddleware, getResumeHistory);
router.get("/:resumeId/analysis", authMiddleware, getResumeAnalysis);
router.delete("/:resumeId", authMiddleware, resumeDelete);
router.put("/:resumeId", authMiddleware, ResumeEdit); 
export default router;
