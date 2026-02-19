import mongoose from "mongoose";

const testCaseSchema = new mongoose.Schema(
  {
    input: { type: String, default: "" },
    expectedOutput: { type: String, required: true },
    isHidden: { type: Boolean, default: true }
  },
  { _id: false }
);

const questionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    statement: { type: String, required: true },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "easy" },
    supportedLanguages: {
      type: [String],
      default: ["c", "cpp", "java", "python", "javascript"]
    },
    testCases: { type: [testCaseSchema], default: [] }
  },
  { timestamps: true }
);

export default mongoose.model("Question", questionSchema);
