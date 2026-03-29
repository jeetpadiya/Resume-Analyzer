import { parserData, parserHelpers } from "../parserData.js";

export const extractExperience = (text: string) => {
  const lowerText = text.toLowerCase();
  const matchedKeywords = parserHelpers.findKeywordsInText(text, parserData.experienceKeywords);
  const yearMatch = lowerText.match(/(\d+)\+?\s+years?/i);
  const monthMatch = lowerText.match(/(\d+)\+?\s+months?/i);

  const duration =
    (yearMatch ? Number.parseInt(yearMatch[1], 10) * 12 : 0) +
    (monthMatch ? Number.parseInt(monthMatch[1], 10) : 0);

  if (!matchedKeywords.length && duration === 0) {
    return [];
  }

  return [
    {
      company: "Unknown",
      role: "Unknown",
      duration: duration || 12,
      description: matchedKeywords.length
        ? `Detected experience signals: ${matchedKeywords.slice(0, 4).join(", ")}`
        : "Experience section detected from resume text",
    },
  ];
};
