
import mammoth from "mammoth";

import { extractSkills } from "./extractors/skills.extractor.js";
import { extractEducation } from "./extractors/education.extractor.js";
import { extractExperience } from "./extractors/experience.extractor.js";

const parsePDF = async (buffer: Buffer): Promise<string> => {
   //  @ts-ignore
  const pdfParse = (await import("pdf-parse/lib/pdf-parse.js")).default as any;

  const data = await pdfParse(buffer);
  return data.text;
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

    text = text.slice(0, 5000);

    console.log("PDF parsed.");
  }

  // ✅ DOCX
  else if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    text = result.value;
  }

  else {
    throw new Error("Unsupported file type");
  }

  console.log("TEXT SAMPLE:", text.slice(0, 200));

  return {
    skills: extractSkills(text) || [],
    education: extractEducation(text) || [],
    experience: extractExperience(text) || [],
    projects: [],
    rawText: text || "",
  };
};