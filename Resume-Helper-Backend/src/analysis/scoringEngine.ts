// src/analysis/scoringEngine.ts

type Resume = {
  skills: string[];
  experience: {
    company: string;
    role: string;
    duration: number;
    description: string;
  }[];
  education: string[];
  projects: string[];
  rawText: string;
};

const WEIGHTS = {
  KEYWORDS: 30,
  SKILLS: 25,
  EXPERIENCE: 15,
  FORMAT: 10,
  SECTIONS: 10,
  READABILITY: 10,
};

// ---------- NORMALIZATION (CRITICAL FIX) ----------

// normalize everything consistently
const clean = (text: string) =>
  text
    .toLowerCase()
    .replace(/\.?js/g, "")       // react.js → react
    .replace(/[^a-z0-9\s]/g, " ") // remove symbols
    .replace(/\s+/g, " ")
    .trim();

const tokenize = (text: string): string[] =>
  clean(text).split(" ").filter(Boolean);

// normalize skill like "react js", "node-js"

const SKILL_ALIASES: Record<string, string> = {
  "reactjs": "react",
  "nodejs": "node",
  "node.js": "node",
  "rest api": "restapi",
  "mongo": "mongodb"
}

// const cleanSkill = (skill: string) =>
//   clean(skill).replace(/\s/g, ""); // "react js" → "react"

 const normalizeSkill = (skill: string) => {
  const cleaned = clean(skill).replace(/\s/g, "");
  return SKILL_ALIASES[cleaned] || cleaned;
};


// ---------- 1. KEYWORD SCORE ----------

  const STOP_WORDS = new Set([
  "and", "or", "with", "the", "a", "an",
  "developer", "engineer", "experience",
  "looking", "for", "role", "in"
]);

const getKeywordScore = (resume: Resume, jobDesc: string) => {
  if (!jobDesc) return 0;

  const resumeTokens = new Set([
    ...tokenize(resume.rawText),
    ...resume.skills.map(normalizeSkill),
  ]);

//   const STOP_WORDS = new Set([
//   "and", "or", "with", "the", "a", "an",
//   "developer", "engineer", "experience",
//   "looking", "for", "role", "in"
// ]);

  const jobTokens = tokenize(jobDesc).filter(
  word => !STOP_WORDS.has(word) && word.length > 2).map(normalizeSkill);

  let match = 0;

  jobTokens.forEach(word => {
    if (resumeTokens.has(word)) match++;
  });

  const ratio = match / (jobTokens.length || 1);

  return Math.min(ratio * WEIGHTS.KEYWORDS, WEIGHTS.KEYWORDS);
};

// ---------- 2. SKILL SCORE (FIXED) ----------

const getSkillScore = (resume: Resume, jobDesc: string) => {
  if (!jobDesc) return 0;

  const resumeSkills = new Set(
    resume.skills.map(normalizeSkill)
  );

 const jobTokens = tokenize(jobDesc)
  .filter(word => !STOP_WORDS.has(word) && word.length > 2)
  .map(normalizeSkill);

  let match = 0;

  jobTokens.forEach(skill => {
    if (resumeSkills.has(skill)) match++;
  });

  const ratio = match / (jobTokens.length || 1);

  return Math.min(ratio * WEIGHTS.SKILLS, WEIGHTS.SKILLS);
};

// ---------- 3. EXPERIENCE ----------

const getExperienceScore = (resume: Resume, jobDesc: string) => {
  const totalMonths = resume.experience.reduce(
    (acc, exp) => acc + (exp.duration || 0),
    0
  );

  const years = totalMonths / 12;

  const match = jobDesc.match(/(\d+)\+?\s*years?/i);
  const expected = match ? parseInt(match[1]) : 3;

  if (years === 0) return 0;

  const ratio = years / expected;

  return Math.min(ratio * WEIGHTS.EXPERIENCE, WEIGHTS.EXPERIENCE);
};

// ---------- 4. FORMAT ----------

const getFormatScore = (resume: Resume) => {
  const text = resume.rawText;
  let score = WEIGHTS.FORMAT;

  if (text.length < 400) score -= 5;
  if (text.length > 6000) score -= 2;

  return Math.max(score, 0);
};

// ---------- 5. SECTION ----------

const getSectionScore = (resume: Resume) => {
  let score = 0;

  if (resume.skills.length) score += 3;
  if (resume.experience.length) score += 3;
  if (resume.education.length) score += 2;
  if (resume.projects.length) score += 2;

  return Math.min(score, WEIGHTS.SECTIONS);
};

// ---------- 6. READABILITY ----------

const getReadabilityScore = (resume: Resume) => {
  const text = resume.rawText;
  let score = 0;

  const words = text.split(/\s+/).length;

  if (words > 100) score += 5;
  if (text.includes("•") || text.includes("-")) score += 5;

  return Math.min(score, WEIGHTS.READABILITY);
};

// ---------- 7. SCORE LABEL ----------

const getScoreLabel = (score: number) => {
  if (score >= 80) return "Strong match";
  if (score >= 60) return "Good match";
  if (score >= 40) return "Average match";
  return "Weak match";
};


// ---------- MAIN ENGINE ----------

export const calculateATSScore = (resume: Resume, jobDesc: string) => {
  const keywordScore = getKeywordScore(resume, jobDesc);
  const skillScore = getSkillScore(resume, jobDesc);
  const experienceScore = getExperienceScore(resume, jobDesc);
  const formatScore = getFormatScore(resume);
  const sectionScore = getSectionScore(resume);
  const readabilityScore = getReadabilityScore(resume);

  const total =
    keywordScore +
    skillScore +
    experienceScore +
    formatScore +
    sectionScore +
    readabilityScore;

      const scoreLabel = getScoreLabel(total);


  // 🔥 missing skills (important)
  const resumeSkills = new Set(resume.skills.map(normalizeSkill));
  const jobTokens = tokenize(jobDesc)
  .filter(word => !STOP_WORDS.has(word) && word.length > 2)
  .map(normalizeSkill);

  const missingSkills = jobTokens.filter(
    skill => !resumeSkills.has(skill)
  );

  const suggestions: string[] = [];

// Skill gaps
if (skillScore < 15) {
  suggestions.push("Add more relevant skills from job description");
}

// Missing skills
missingSkills.slice(0, 5).forEach(skill => {
  suggestions.push(`Add skill: ${skill}`);
});

// Experience
if (experienceScore < 8) {
  suggestions.push("Add more experience or highlight projects as experience");
}

// Sections
if (resume.projects.length === 0) {
  suggestions.push("Add projects section to strengthen profile");
}

// Readability
if (!resume.rawText.includes("•")) {
  suggestions.push("Use bullet points for better readability");
}

  return {
    total: Math.round(total),
    lableLabel: scoreLabel,
    breakdown: {
      keywordScore: Math.round(keywordScore),
      skillScore: Math.round(skillScore),
      experienceScore: Math.round(experienceScore),
      formatScore: Math.round(formatScore),
      sectionScore: Math.round(sectionScore),
      readabilityScore: Math.round(readabilityScore),
    },
    missingSkills,
    suggestions,
  };
};