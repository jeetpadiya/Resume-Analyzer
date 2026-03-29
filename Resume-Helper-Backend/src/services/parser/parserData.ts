import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const parserDataDir = path.resolve(currentDir, "../../data/parser");

const readJsonFile = <T>(fileName: string): T => {
  const filePath = path.join(parserDataDir, fileName);
  const raw = readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as T;
};

const skills = readJsonFile<string[]>("skills.json");
const skillAliases = readJsonFile<Record<string, string>>("skillAliases.json");
const educationKeywords = readJsonFile<string[]>("educationKeywords.json");
const experienceKeywords = readJsonFile<string[]>("experienceKeywords.json");
const stopWords = readJsonFile<string[]>("stopWords.json");
const certifications = readJsonFile<string[]>("certifications.json");
const jobTitles = readJsonFile<string[]>("jobTitles.json");
const sectionKeywords = readJsonFile<Record<string, string[]>>("sectionKeywords.json");

const normalizeToken = (value: string) =>
  value
    .toLowerCase()
    .replace(/c\+\+/g, "cplusplus")
    .replace(/c#/g, "csharp")
    .replace(/\.net/g, "dotnet")
    .replace(/node\.js/g, "nodejs")
    .replace(/react\.js/g, "reactjs")
    .replace(/next\.js/g, "nextjs")
    .replace(/vue\.js/g, "vuejs")
    .replace(/[.+#]/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const skillLookup = new Map<string, string>();

skills.forEach((skill) => {
  skillLookup.set(normalizeToken(skill), skill);
});

Object.entries(skillAliases).forEach(([alias, canonical]) => {
  skillLookup.set(normalizeToken(alias), canonical);
});

const unique = <T>(values: T[]) => Array.from(new Set(values));

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const normalizeSkill = (value: string) => {
  const normalized = normalizeToken(value);
  return skillLookup.get(normalized) || value.trim();
};

export const findKnownSkillsInText = (text: string) => {
  const normalizedText = normalizeToken(text);
  const skillMatches: string[] = [];

  skillLookup.forEach((canonicalSkill, alias) => {
    const pattern = new RegExp(`(^|\\s)${escapeRegExp(alias)}(\\s|$)`, "i");

    if (pattern.test(normalizedText)) {
      skillMatches.push(canonicalSkill);
    }
  });

  return unique(skillMatches).sort((a, b) => a.localeCompare(b));
};

export const findKeywordsInText = (text: string, keywords: string[]) => {
  const normalizedText = normalizeToken(text);

  return keywords.filter((keyword) => {
    const pattern = new RegExp(`(^|\\s)${escapeRegExp(normalizeToken(keyword))}(\\s|$)`, "i");
    return pattern.test(normalizedText);
  });
};

export const parserData = {
  certifications,
  educationKeywords,
  experienceKeywords,
  jobTitles,
  sectionKeywords,
  skills,
  stopWords,
};

export const parserHelpers = {
  normalizeSkill,
  normalizeToken,
  findKnownSkillsInText,
  findKeywordsInText,
  unique,
};
