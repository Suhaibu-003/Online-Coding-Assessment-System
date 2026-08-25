import nodemailer from "nodemailer";

// In-memory OTP storage: { email: { otp, expiryTime } }
const otpStore = {};

// Create transporter lazily - ensures env vars are loaded
const getTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  
  if (!user || !pass) {
    console.error("Missing Gmail credentials:", { user: !!user, pass: !!pass });
    throw new Error("Missing EMAIL_USER or EMAIL_PASS environment variables");
  }
  
  console.log("Creating transporter with email:", user);

  const port = Number(process.env.EMAIL_PORT || 587);
  
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port,
    secure: process.env.EMAIL_SECURE === "true" || port === 465,
    requireTLS: port !== 465,
    family: 4,
    auth: {
      user: user,
      pass: pass
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000
  });
};

/**
 * Generate a 6-digit OTP (numbers only: 0-9)
 */
export const generateOTP = () => {
  let otp = "";
  for (let i = 0; i < 6; i++) {
    otp += Math.floor(Math.random() * 10);
  }
  return otp;
};

/**
 * Send OTP to email
 */
export const sendOTPEmail = async (email) => {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email format");
    }

    // Generate OTP
    const otp = generateOTP();
    console.log(`Generated OTP for ${email}: ${otp} (digits only)`);

    // Set 5-minute expiry
    const expiryTime = Date.now() + 5 * 60 * 1000;

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP for Registration",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 40px; background-color: #f5f5f5; border-radius: 10px; max-width: 500px; margin: 0 auto;">
          <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <h2 style="color: #0d6efd; text-align: center; margin: 0 0 20px 0; font-size: 24px;">Email Verification</h2>
            <p style="color: #666; text-align: center; font-size: 16px; margin: 0 0 30px 0;">
              Your OTP code is:
            </p>
            <div style="background: #f0f0f0; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 30px; border: 2px solid #0d6efd;">
              <h1 style="color: #0d6efd; text-align: center; letter-spacing: 8px; font-size: 36px; margin: 0; font-weight: bold; font-family: monospace;">
                ${otp}
              </h1>
            </div>
            <p style="color: #999; text-align: center; font-size: 14px; margin: 0 0 15px 0;">
              This code will expire in <strong>5 minutes</strong>.
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #999; text-align: center; font-size: 12px; margin: 0;">
              If you didn't request this code, please ignore this email.
            </p>
          </div>
        </div>
      `
    };

    await getTransporter().sendMail(mailOptions);

    // Store only after the email was sent successfully. A failed send should
    // not leave an OTP that the user never received.
    otpStore[email] = { otp, expiryTime };

    return {
      success: true,
      message: "OTP sent to email successfully",
      expiresIn: 300 // 5 minutes in seconds
    };
  } catch (error) {
    throw new Error(`Failed to send OTP: ${error.message}`);
  }
};

/**
 * Verify OTP - Only accepts 6-digit codes
 */
export const verifyOTP = (email, otp) => {
  try {
    // Validate OTP is digits only and exactly 6 characters
    const otpString = otp.toString().trim();
    if (!/^\d{6}$/.test(otpString)) {
      throw new Error("OTP must be exactly 6 digits.");
    }

    // Check if OTP exists for this email
    if (!otpStore[email]) {
      throw new Error("OTP not found. Please request a new OTP.");
    }

    const { otp: storedOTP, expiryTime } = otpStore[email];

    // Check if OTP has expired
    if (Date.now() > expiryTime) {
      delete otpStore[email];
      throw new Error("OTP has expired. Please request a new OTP.");
    }

    // Match OTP (strict comparison)
    if (storedOTP !== otpString) {
      throw new Error("Invalid OTP. Please try again.");
    }

    // Delete OTP after successful verification
    delete otpStore[email];

    return {
      success: true,
      message: "OTP verified successfully"
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * Clear OTP for an email
 */
export const clearOTP = (email) => {
  delete otpStore[email];
};
