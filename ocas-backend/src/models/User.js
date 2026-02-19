import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    // Local users only
    password: { type: String, minlength: 6, default: null },

    // Track login method
    authProvider: { type: String, enum: ["local", "google"], default: "local" },

    // Only you will manually set admin in DB
    role: { type: String, enum: ["admin", "candidate"], default: "candidate" }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
