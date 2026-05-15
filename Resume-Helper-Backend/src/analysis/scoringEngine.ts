import { GoogleGenerativeAI } from "@google/generative-ai";

type Resume = {
  skills: string[];
  experience: { company: string; role: string; duration: number; description: string }[];
  education: string[];
  projects: string[];
  rawText: string;
};

const getGenAI = () => new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const calculateATSScore = async (resume: Resume, jobDesc: string) => {
  if (!jobDesc || jobDesc.trim().length === 0) {
    return {
      total: 0,
      scoreLabel: "Weak match",
      breakdown: { keywordScore: 0, skillScore: 0, experienceScore: 0, formatScore: 0, sectionScore: 0, readabilityScore: 0 },
      missingSkills: [],
      suggestions: ["Please provide a job description for ATS scoring."],
    };
  }

  try {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
You are an expert ATS (Applicant Tracking System) scoring engine.
Evaluate the following resume against the provided job description.
Return ONLY a valid JSON object matching the following structure. Do NOT include any markdown formatting like \`\`\`json.

{
  "total": number (0-100),
  "scoreLabel": string ("Strong match" | "Good match" | "Average match" | "Weak match"),
  "breakdown": {
    "keywordScore": number (0-30),
    "skillScore": number (0-25),
    "experienceScore": number (0-15),
    "formatScore": number (0-10),
    "sectionScore": number (0-10),
    "readabilityScore": number (0-10)
  },
  "missingSkills": [string] (up to 5 most important missing skills),
  "suggestions": [string] (3-5 highly actionable suggestions to improve the resume for this specific job)
}

Resume Data:
${JSON.stringify({
  skills: resume.skills,
  experience: resume.experience,
  education: resume.education,
  projects: resume.projects,
  textSnippet: resume.rawText.substring(0, 3000)
})}

Job Description:
${jobDesc}
`;

    const result = await model.generateContent(prompt);
    let jsonStr = result.response.text();
    jsonStr = jsonStr.replace(/```json\n?|```\n?/g, '').trim();
    
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("AI Scoring Error:", error);
    // Fallback if AI fails
    return {
      total: 50,
      scoreLabel: "Average match",
      breakdown: { keywordScore: 15, skillScore: 10, experienceScore: 10, formatScore: 5, sectionScore: 5, readabilityScore: 5 },
      missingSkills: [],
      suggestions: ["AI scoring service is temporarily unavailable. Please try again later."],
    };
  }
};
