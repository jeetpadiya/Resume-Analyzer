import { parserHelpers } from "../parserData.js";

export const extractSkills = (text: string): string[] => parserHelpers.findKnownSkillsInText(text);
