import mongoose from "mongoose";

const experienceSchema = new mongoose.Schema({
  company: { type: String },
  role: { type: String },
  duration: { type: Number }, // months
  description: { type: String },
});

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    fileUrl: { type: String, required: true },

    parsedData: {
      skills: [{ type: String }],
      experience: [experienceSchema],
      education: [{ type: String }],
      projects: [{ type: String }],
      rawText: { type: String },
    },

    status: {
      type: String,
      enum: ["uploaded", "parsed", "analyzed"],
      default: "uploaded",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Resume", resumeSchema);