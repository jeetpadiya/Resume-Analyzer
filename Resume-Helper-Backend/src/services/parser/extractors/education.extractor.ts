import { parserData, parserHelpers } from "../parserData.js";

export const extractEducation = (text: string): string[] =>
  parserHelpers.findKeywordsInText(text, parserData.educationKeywords);
