import { z } from "zod";

export const aiFeatureSchema = z.object({
  body: z.object({
    resumeId: z.string().min(1, "Resume ID is required"),
    jobDescription: z.string().min(10, "Job description must be at least 10 characters"),
  }),
});

export const analyzeResumeSchema = z.object({
  body: z.object({
    resumeId: z.string().min(1, "Resume ID is required"),
    jobDescription: z.string().optional(),
  }),
});
