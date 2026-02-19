import mongoose from "mongoose";

const testSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    durationMinutes: { type: Number, default: 60 },
    isPublished: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }]
  },
  { timestamps: true }
);

export default mongoose.model("Test", testSchema);
