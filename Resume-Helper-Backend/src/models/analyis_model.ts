import mongoose from "mongoose";

const analysisSchema = new mongoose.Schema({

    resume:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resume',
        required: true
    },
    score:{type:Number,min:0,max:100},
    lable: String, // e.g. "Excellent", "Good", "Needs Improvement"

    breakdown: {
      keywordScore: Number,
      skillScore: Number,
      experienceScore: Number,
      formatScore: Number,
      sectionScore: Number,
      readabilityScore: Number,
    },

     suggestions: [String], // future improvement hints

    jobDescription: String, // optional for matching
     missingSkills: [String], // skills from job description not in resume
},
{timestamps: true}
)

export default mongoose.model("Analysis", analysisSchema);