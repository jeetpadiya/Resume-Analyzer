import mammoth from "mammoth";
import { GoogleGenerativeAI } from "@google/generative-ai";

const getGenAI = () => new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const parsePDF = async (buffer: Buffer): Promise<string> => {
   //  @ts-ignore
  const pdfParse = (await import("pdf-parse/lib/pdf-parse.js")).default as any;

  const data = await pdfParse(buffer);
  return data.text;
};

const extractWithGemini = async (text: string) => {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY not found in environment. Falling back to empty parsing.");
    return { skills: [], education: [], experience: [], projects: [] };
  }

  try {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = `
You are an expert ATS (Applicant Tracking System) parser. Read the following resume text and extract the details into a strict JSON format matching the schema below. 
Do NOT include any markdown formatting like \`\`\`json. Return ONLY valid JSON.

Schema:
{
  "skills": ["skill1", "skill2"],
  "education": ["Degree from University, Year"],
  "experience": [
    {
      "company": "Company Name",
      "role": "Job Title",
      "duration": 24, // total duration in months
      "description": "Short summary of responsibilities and achievements"
    }
  ],
  "projects": ["Project Name: Description"]
}

Resume Text:
${text}
`;

    const result = await model.generateContent(prompt);
    let jsonStr = result.response.text();
    
    jsonStr = jsonStr.replace(/```json\n?|```\n?/g, '').trim();
    
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    return { skills: [], education: [], experience: [], projects: [] };
  }
};

export const parseResumeFile = async (
  fileBuffer: Buffer,
  mimeType: string
) => {
  let text = "";

  // ✅ PDF
  if (mimeType === "application/pdf") {
    console.log("Parsing PDF...");

    if (fileBuffer.length > 2 * 1024 * 1024) {
      throw new Error("File size exceeds 2MB limit");
    }

    text = await parsePDF(fileBuffer);
    text = text.slice(0, 10000); 

    console.log("PDF parsed.");
  }

  // ✅ DOCX
  else if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    text = result.value.slice(0, 10000);
  }

  else {
    throw new Error("Unsupported file type");
  }

  console.log("TEXT SAMPLE:", text.slice(0, 200));
  
  console.log("Extracting with Gemini AI...");
  const parsedData = await extractWithGemini(text);

  return {
    skills: parsedData.skills || [],
    education: parsedData.education || [],
    experience: parsedData.experience || [],
    projects: parsedData.projects || [],
    rawText: text || "",
  };
};