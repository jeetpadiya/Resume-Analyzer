import Resume from "../models/resume_model.js";
import Analysis from "../models/analyis_model.js";
import {calculateATSScore} from '../analysis/scoringEngine.js';

export const analyzeResume = async (req: any, res: any) => {
  try {
    const { resumeId, jobDescription } = req.body;

    if (!req.user?.id) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    const resume = await Resume.findOne({
      _id: resumeId,
      user: req.user.id,
    });

    if (!resume || !resume.parsedData) {
      return res.status(404).json({
        message: "Resume not found or not accessible",
      });
    }

    const parsedData = resume.parsedData;

    const safeResume = {
      skills: parsedData.skills || [],
      education: parsedData.education || [],
      projects: parsedData.projects || [],
      rawText: parsedData.rawText || "",
      experience: (parsedData.experience || []).map((exp: any) => ({
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
      lable: result.lableLabel,
      breakdown: result.breakdown,
      jobDescription,
      suggestions: result.suggestions,
      missingSkills: result.missingSkills,
    });

    res.json({
      success: true,
      data: analysis,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
