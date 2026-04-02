import express from "express";
import { sendOTP, verifyOTPHandler } from "../controllers/otpController.js";

const router = express.Router();

router.post("/send", sendOTP);
router.post("/verify", verifyOTPHandler);

export default router;
