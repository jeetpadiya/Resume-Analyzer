import Resume from "../models/resume_model.js";
import Analysis from "../models/analyis_model.js";
import { parseResumeFile } from "../services/parser/parser_service.js"


export const uploadResume = async (req: any, res: any) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    if (!req.user?.id) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    const parsedData = await parseResumeFile(
      file.buffer,
      file.mimetype
    );

    const resume = await Resume.create({
      user: req.user.id,
      fileUrl: "local-file", // placeholder
      originalFileName: file.originalname,
      parsedData,
      status: "parsed",
    });

    res.json({
      success: true,
      data: resume,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getResumeHistory = async (req: any, res: any) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    const resumes = await Resume.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    const resumeIds = resumes.map((resume) => resume._id);

    const analyses = resumeIds.length
      ? await Analysis.find({ resume: { $in: resumeIds } })
          .sort({ createdAt: -1 })
          .lean()
      : [];

    const latestAnalysisByResume = new Map<string, any>();

    analyses.forEach((analysis) => {
      const resumeId = String(analysis.resume);

      if (!latestAnalysisByResume.has(resumeId)) {
        latestAnalysisByResume.set(resumeId, analysis);
      }
    });

    const data = resumes.map((resume) => {
      const latestAnalysis = latestAnalysisByResume.get(String(resume._id));

      return {
        _id: resume._id,
        originalFileName: resume.originalFileName || "Untitled Resume",
        fileUrl: resume.fileUrl,
        status: resume.status,
        createdAt: resume.createdAt,
        updatedAt: resume.updatedAt,
        latestAnalysis: latestAnalysis
          ? {
              _id: latestAnalysis._id,
              score: latestAnalysis.score,
              lable: latestAnalysis.lable,
              breakdown: latestAnalysis.breakdown,
              createdAt: latestAnalysis.createdAt,
            }
          : null,
      };
    });

    res.json({
      success: true,
      data,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
export const resumeDelete = async (req: any, res: any) => {
  try {
    const resumeId = req.params.resumeId;

    if (!req.user?.id) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    const deletedResume = await Resume.findOneAndDelete({
      _id: resumeId,
      user: req.user.id,
    });

    if (!deletedResume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    return res.json({
      success: true,
      message: "Resume deleted successfully",
    });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

export const ResumeEdit = async (req:any, res:any)=>{
    try {
      const resumeId = req.params.resumeId;
      const { originalFileName } = req.body;
  
      if (!req.user?.id) {
        return res.status(401).json({ message: "Invalid token payload" });
      }

      const updateResume = await Resume.findOneAndUpdate(
        {
          _id: resumeId,
          user: req.user.id,
        },
        {
          originalFileName
        },
        { new: true }
      );
  
      if (!updateResume) {
        return res.status(404).json({ message: "Resume not found" });
      }
  
      return res.json({
        success: true,
        data: updateResume,
      });
    }
    catch (err:any) {      
      return res.status(500).json({ message: err.message });
    }
}
