import mongoose from "mongoose";

const caseResultSchema = new mongoose.Schema(
  {
    input: String,
    expectedOutput: String,
    actualOutput: String,
    passed: Boolean,
    status: String,
    time: Number,
    memory: Number,
    isHidden: Boolean
  },
  { _id: false }
);

const submissionSchema = new mongoose.Schema(
  {
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    test: { type: mongoose.Schema.Types.ObjectId, ref: "Test", required: true },
    question: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },

    language: { type: String, enum: ["c", "cpp", "java", "python"], required: true },
    sourceCode: { type: String, required: true },

    status: { type: String, enum: ["RUNNING", "COMPLETED", "ERROR"], default: "RUNNING" },
    totalCases: { type: Number, default: 0 },
    passedCases: { type: Number, default: 0 },
    score: { type: Number, default: 0 },

    results: { type: [caseResultSchema], default: [] }
  },
  { timestamps: true }
);

export default mongoose.model("Submission", submissionSchema);
