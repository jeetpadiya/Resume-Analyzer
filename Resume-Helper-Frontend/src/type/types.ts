export interface AnalysisResult {
    score:number;
    lable:string;
    missingSkills?:string[];
    suggestions?:string[];
    breakdown?:Record<string, number>;
}