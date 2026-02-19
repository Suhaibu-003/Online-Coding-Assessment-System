import bcrypt from "bcryptjs";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ✅ REGISTER (always candidate)
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body; // ❌ remove role

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please provide name, email, password");
  }

  const exists = await User.findOne({ email });
  if (exists) {
    res.status(400);
    throw new Error("Email already registered");
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashed,
    role: "candidate",          // ✅ always candidate
    authProvider: "local"       // ✅ mark local auth
  });

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user._id, user.role)
  });
});

// ✅ LOGIN (local only)
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Please provide email and password");
  }

  const user = await User.findOne({ email });
  if (!user) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  // ✅ If user created via Google, block password login
  if (user.authProvider === "google") {
    res.status(400);
    throw new Error("This account uses Google Sign-In. Please login with Google.");
  }

  const ok = await bcrypt.compare(password, user.password || "");
  if (!ok) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user._id, user.role)
  });
});

// ✅ GOOGLE LOGIN (always candidate)
export const googleLogin = asyncHandler(async (req, res) => {
  const { credential } = req.body;
  if (!credential) {
    res.status(400);
    throw new Error("No credential provided");
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID
  });

  const payload = ticket.getPayload();
  const email = payload?.email;
  const name = payload?.name || "Google User";

  if (!email) {
    res.status(400);
    throw new Error("Google login failed: email not found");
  }

  let user = await User.findOne({ email });

  // If user exists and is local, you can choose:
  // Option A: allow google login anyway
  // Option B: block and ask them to use password
  // I will do Option A (more user-friendly)

  if (!user) {
    user = await User.create({
      name,
      email,
      password: null,           // ✅ no fake password
      role: "candidate",        // ✅ always candidate
      authProvider: "google"
    });
  }

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user._id, user.role)
  });
});
