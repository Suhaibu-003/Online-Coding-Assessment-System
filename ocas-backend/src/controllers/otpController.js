import asyncHandler from "express-async-handler";
import { sendOTPEmail, verifyOTP } from "../services/emailOTP.js";

/**
 * POST /api/otp/send
 * Send OTP to email
 */
export const sendOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error("Email is required");
  }

  const result = await sendOTPEmail(email);
  res.status(200).json(result);
});

/**
 * POST /api/otp/verify
 * Verify OTP - expects exactly 6 digits
 */
export const verifyOTPHandler = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    res.status(400);
    throw new Error("Email and OTP are required");
  }

  // Validate OTP format: must be 6 digits
  if (!/^\d{6}$/.test(otp.toString())) {
    res.status(400);
    throw new Error("OTP must be exactly 6 digits");
  }

  const result = verifyOTP(email, otp);
  res.status(200).json(result);
});
