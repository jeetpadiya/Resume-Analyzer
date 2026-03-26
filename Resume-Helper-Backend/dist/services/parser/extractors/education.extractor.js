// education.extractor.ts
const DEGREE_KEYWORDS = [
    "bca", "b.tech", "bachelor",
    "hsc", "ssc", "mca", "master"
];
export const extractEducation = (text) => {
    const lower = text.toLowerCase();
    return DEGREE_KEYWORDS.filter(degree => lower.includes(degree));
};
