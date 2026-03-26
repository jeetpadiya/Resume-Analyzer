// skills.extractor.ts

const SKILLS_DB = [
  // Core Languages & Runtimes
  "javascript",
  "typescript",
  "node",
  "python",
  "go",
  
  // Frontend Frameworks & Libraries
  "react",
  "nextjs",
  "vue",
  "angular",
  "redux",
  
  // Backend & APIs
  "express",
  "nestjs",
  "graphql",
  "rest-api",
  
  // Databases
  "mongodb",
  "postgresql",
  "redis",
  "mysql",
  
  // Styling & UI
  "html",
  "css",
  "tailwind",
  "sass",
  "styled-components",
  
  // DevOps & Tools
  "docker",
  "kubernetes",
  "aws",
  "git",
  "firebase",
  
  // Testing
  "jest",
  "cypress",
  "playwright"
];

export const extractSkills = (text: string): string[] => {
  const lower = text.toLowerCase();

  return SKILLS_DB.filter(skill => lower.includes(skill));
};