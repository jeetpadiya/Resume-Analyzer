// routes.ts
import express from "express";
import { uploadResume } from '../controllers/resumeController.js';
import { analyzeResume } from "../controllers/analysisController.js";
import { authMiddleware } from '../middlewares/auth.js'
import { upload } from "../middlewares/upload.js";

const router = express.Router();

router.post("/upload", authMiddleware,upload.single('file'),uploadResume);
router.post("/analyze", authMiddleware, analyzeResume);

export default router;