import PDFParser from "pdf2json";
import mammoth from "mammoth";
import { extractSkills } from "./extractors/skills.extractor.js";
import { extractEducation } from "./extractors/education.extractor.js";
import { extractExperience } from "./extractors/experience.extractor.js";
const parsePDF = (buffer) => {
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser();
        pdfParser.on("pdfParser_dataError", (errData) => {
            reject(errData.parserError);
        });
        pdfParser.on("pdfParser_dataReady", (pdfData) => {
            try {
                let text = "";
                pdfData.Pages.forEach((page) => {
                    page.Texts.forEach((textItem) => {
                        textItem.R.forEach((r) => {
                            try {
                                text += decodeURIComponent(r.T) + " ";
                            }
                            catch {
                                text += r.T + " "; // fallback if malformed
                            }
                        });
                    });
                });
                resolve(text);
            }
            catch (err) {
                reject(err);
            }
        });
        pdfParser.parseBuffer(buffer);
    });
};
export const parseResumeFile = async (fileBuffer, mimeType) => {
    let text = "";
    if (mimeType === "application/pdf") {
        text = await parsePDF(fileBuffer);
    }
    else if (mimeType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
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
