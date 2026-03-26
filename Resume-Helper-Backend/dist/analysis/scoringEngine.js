// src/analysis/scoringEngine.ts
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
const clean = (text) => text
    .toLowerCase()
    .replace(/\.?js/g, "") // react.js → react
    .replace(/[^a-z0-9\s]/g, " ") // remove symbols
    .replace(/\s+/g, " ")
    .trim();
const tokenize = (text) => clean(text).split(" ").filter(Boolean);
// normalize skill like "react js", "node-js"
const cleanSkill = (skill) => clean(skill).replace(/\s/g, ""); // "react js" → "react"
// ---------- 1. KEYWORD SCORE ----------
const getKeywordScore = (resume, jobDesc) => {
    if (!jobDesc)
        return 0;
    const resumeTokens = new Set([
        ...tokenize(resume.rawText),
        ...resume.skills.map(cleanSkill),
    ]);
    const jobTokens = tokenize(jobDesc);
    let match = 0;
    jobTokens.forEach(word => {
        if (resumeTokens.has(word))
            match++;
    });
    const ratio = match / (jobTokens.length || 1);
    return Math.min(ratio * WEIGHTS.KEYWORDS, WEIGHTS.KEYWORDS);
};
// ---------- 2. SKILL SCORE (FIXED) ----------
const getSkillScore = (resume, jobDesc) => {
    if (!jobDesc)
        return 0;
    const resumeSkills = new Set(resume.skills.map(cleanSkill));
    const jobTokens = tokenize(jobDesc).map(t => t.replace(/\s/g, ""));
    let match = 0;
    jobTokens.forEach(skill => {
        if (resumeSkills.has(skill))
            match++;
    });
    const ratio = match / (jobTokens.length || 1);
    return Math.min(ratio * WEIGHTS.SKILLS, WEIGHTS.SKILLS);
};
// ---------- 3. EXPERIENCE ----------
const getExperienceScore = (resume, jobDesc) => {
    const totalMonths = resume.experience.reduce((acc, exp) => acc + (exp.duration || 0), 0);
    const years = totalMonths / 12;
    const match = jobDesc.match(/(\d+)\+?\s*years?/i);
    const expected = match ? parseInt(match[1]) : 3;
    if (years === 0)
        return 0;
    const ratio = years / expected;
    return Math.min(ratio * WEIGHTS.EXPERIENCE, WEIGHTS.EXPERIENCE);
};
// ---------- 4. FORMAT ----------
const getFormatScore = (resume) => {
    const text = resume.rawText;
    let score = WEIGHTS.FORMAT;
    if (text.length < 400)
        score -= 5;
    if (text.length > 6000)
        score -= 2;
    return Math.max(score, 0);
};
// ---------- 5. SECTION ----------
const getSectionScore = (resume) => {
    let score = 0;
    if (resume.skills.length)
        score += 3;
    if (resume.experience.length)
        score += 3;
    if (resume.education.length)
        score += 2;
    if (resume.projects.length)
        score += 2;
    return Math.min(score, WEIGHTS.SECTIONS);
};
// ---------- 6. READABILITY ----------
const getReadabilityScore = (resume) => {
    const text = resume.rawText;
    let score = 0;
    const words = text.split(/\s+/).length;
    if (words > 100)
        score += 5;
    if (text.includes("•") || text.includes("-"))
        score += 5;
    return Math.min(score, WEIGHTS.READABILITY);
};
// ---------- MAIN ENGINE ----------
export const calculateATSScore = (resume, jobDesc) => {
    const keywordScore = getKeywordScore(resume, jobDesc);
    const skillScore = getSkillScore(resume, jobDesc);
    const experienceScore = getExperienceScore(resume, jobDesc);
    const formatScore = getFormatScore(resume);
    const sectionScore = getSectionScore(resume);
    const readabilityScore = getReadabilityScore(resume);
    const total = keywordScore +
        skillScore +
        experienceScore +
        formatScore +
        sectionScore +
        readabilityScore;
    // 🔥 missing skills (important)
    const resumeSkills = new Set(resume.skills.map(cleanSkill));
    const jobTokens = tokenize(jobDesc).map(t => t.replace(/\s/g, ""));
    const missingSkills = jobTokens.filter(skill => !resumeSkills.has(skill));
    const suggestions = [];
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
