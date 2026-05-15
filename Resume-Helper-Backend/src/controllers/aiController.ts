import { GoogleGenerativeAI } from "@google/generative-ai";
import Resume from "../models/resume_model.js";

const getGenAI = () => new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const generateCoverLetter = async (req: any, res: any) => {
  try {
    const { resumeId, jobDescription } = req.body;

    if (!req.user?.id) return res.status(401).json({ message: "Invalid token payload" });
    if (!jobDescription) return res.status(400).json({ message: "Job description is required" });

    const resume = await Resume.findOne({ _id: resumeId, user: req.user.id });
    if (!resume) return res.status(404).json({ message: "Resume not found" });

    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `
You are an expert career coach and cover letter writer.
Based on the following resume and job description, write a professional, engaging, and highly tailored cover letter.
Do not use placeholders like [Your Name] if the information is available in the resume, but it's okay to leave placeholders for things that are completely unknown (like company address).

Resume:
${resume.parsedData?.rawText || JSON.stringify(resume.parsedData)}

Job Description:
${jobDescription}
`;

    const result = await model.generateContent(prompt);
    const coverLetter = result.response.text();

    res.json({ success: true, data: coverLetter });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: err.message || "Failed to generate cover letter" });
  }
};

export const improveResume = async (req: any, res: any) => {
  try {
    const { resumeId, jobDescription } = req.body;

    if (!req.user?.id) return res.status(401).json({ message: "Invalid token payload" });
    if (!jobDescription) return res.status(400).json({ message: "Job description is required" });

    const resume = await Resume.findOne({ _id: resumeId, user: req.user.id });
    if (!resume) return res.status(404).json({ message: "Resume not found" });

    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `
You are an expert ATS (Applicant Tracking System) optimizer. 
Based on the following resume experience and the target job description, rewrite the work experience bullet points to be more impactful, action-oriented, and better aligned with the job description.
Focus on quantifiable achievements.

Target Job Description:
${jobDescription}

Current Resume Experience:
${JSON.stringify(resume.parsedData?.experience || [])}

Please return the improved experience section. Use clear formatting so the user can easily read and copy the rewritten bullet points.
`;

    const result = await model.generateContent(prompt);
    const improvement = result.response.text();

    res.json({ success: true, data: improvement });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: err.message || "Failed to improve resume" });
  }
};
