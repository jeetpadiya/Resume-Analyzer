import Resume from "../models/resume_model.js";
import { parseResumeFile } from "../services/parser/parser_service.js"


export const uploadResume = async (req: any, res: any) => {
  try {
    const file = req.file;
    console.log("FILE:", req.file);
    console.log("BUFFER TYPE:", typeof file.buffer);
console.log("BUFFER LENGTH:", file.buffer?.length);

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const parsedData = await parseResumeFile(
      file.buffer,
      file.mimetype
    );

    console.log(parsedData); // DEBUG
console.log("BUFFER TYPE:", typeof file.buffer);
console.log("BUFFER LENGTH:", file.buffer?.length);

    const resume = await Resume.create({
      user: req.user.id,
      fileUrl: "local-file", // placeholder
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