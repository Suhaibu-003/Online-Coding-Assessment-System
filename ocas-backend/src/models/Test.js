import mongoose from "mongoose";

const testSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    durationMinutes: { type: Number, default: 60 },
    isPublished: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
    // Track assigned users for test scheduling
    assignedUsers: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      default: []
    },
    // Whether test is available to all or only assigned users
    isPublicTest: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model("Test", testSchema);
