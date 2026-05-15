export interface AnalysisResult {
    score:number;
    label:string;
    missingSkills?:string[];
    suggestions?:string[];
    breakdown?:Record<string, number>;
}

export interface ResumeHistoryItem {
    _id: string;
    originalFileName: string;
    fileUrl: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    latestAnalysis: {
        _id: string;
        score: number;
        label: string;
        breakdown?: Record<string, number>;
        createdAt: string;
    } | null;
}
