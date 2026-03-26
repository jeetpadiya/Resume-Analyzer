import Resume from "../models/resume_model.js";
import Analysis from "../models/analyis_model.js";
import { calculateATSScore } from '../analysis/scoringEngine.js';
export const analyzeResume = async (req, res) => {
    try {
        const { resumeId, jobDescription } = req.body;
        const resume = await Resume.findById(resumeId);
        if (!resume || !resume.parsedData) {
            return res.status(400).json({
                message: "Resume not parsed yet",
            });
        }
        const parsedData = resume.parsedData;
        const safeResume = {
            skills: parsedData.skills || [],
            education: parsedData.education || [],
            projects: parsedData.projects || [],
            rawText: parsedData.rawText || "",
            experience: (parsedData.experience || []).map((exp) => ({
                company: exp.company || "",
                role: exp.role || "",
                duration: exp.duration || 0,
                description: exp.description || "",
            })),
        };
        const result = calculateATSScore(safeResume, jobDescription || "");
        const analysis = await Analysis.create({
            resume: resumeId,
            score: result.total,
            breakdown: result.breakdown,
            jobDescription,
        });
        res.json({
            success: true,
            data: analysis,
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
