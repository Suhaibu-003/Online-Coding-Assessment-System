import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerApi, sendOtpApi, verifyOtpApi } from "../services/api";

export default function Register() {
  const navigate = useNavigate();
  
  // OTP verification state
  const [step, setStep] = useState("email"); // "email" | "verify" | "register"
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [otpTimer, setOtpTimer] = useState(0);

  // Step 1: Send OTP to email
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setMsg("");
    setSuccessMsg("");

    if (!email.trim()) {
      setMsg("Please enter your email.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMsg("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      await sendOtpApi(email);
      setSuccessMsg("OTP sent to your email! Check your inbox.");
      setStep("verify");
      // Start 5-minute timer
      setOtpTimer(300);
    } catch (err) {
      setMsg(err?.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // OTP timer countdown
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpTimer]);

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setMsg("");
    setSuccessMsg("");

    if (!otp.trim()) {
      setMsg("Please enter the OTP.");
      return;
    }

    if (otp.length !== 6) {
      setMsg("OTP must be 6 digits.");
      return;
    }

    try {
      setLoading(true);
      await verifyOtpApi(email, otp);
      setSuccessMsg("Email verified successfully!");
      setForm((prev) => ({ ...prev, email }));
      setStep("register");
    } catch (err) {
      setMsg(err?.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Register after OTP verification
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setSuccessMsg("");

    if (!form.name || !form.password || !form.confirmPassword) {
      setMsg("Please fill all fields.");
      return;
    }

    if (form.password.length < 6) {
      setMsg("Password must be at least 6 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setMsg("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const res = await registerApi({
        name: form.name,
        email: form.email,
        password: form.password
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("user", JSON.stringify(res.data));

      navigate("/candidate");
    } catch (err) {
      setMsg(err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center px-3"
      style={{
        background: "linear-gradient(135deg, #f8f9fa, #e9ecef)",
      }}
    >
      <div
        className="row w-100 shadow-lg rounded-4 overflow-hidden bg-white"
        style={{ maxWidth: "950px" }}
      >
        {/* Left Side */}
        <div
          className="col-md-6 d-none d-md-flex flex-column justify-content-center p-5 text-white"
          style={{
            background: "linear-gradient(135deg, #0d6efd, #0a58ca)",
            minHeight: "600px",
          }}
        >
          <h1 className="fw-bold mb-3">Coding Platform</h1>
          <p className="mb-4 text-white-50" style={{ lineHeight: "1.8" }}>
            Create your account to access coding assessments, track progress,
            and experience a clean and modern online test platform.
          </p>

          <div className="mt-3">
            <div className="mb-3">
              <h6 className="fw-semibold mb-1">✔ Email Verification</h6>
              <small className="text-white-50">
                Secure verification via OTP
              </small>
            </div>
            <div className="mb-3">
              <h6 className="fw-semibold mb-1">✔ Candidate Dashboard</h6>
              <small className="text-white-50">
                Access tests and results in one place
              </small>
            </div>
            <div>
              <h6 className="fw-semibold mb-1">✔ Secure Access</h6>
              <small className="text-white-50">
                Admin and candidate roles managed safely
              </small>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="col-md-6 p-4 p-md-5 d-flex flex-column justify-content-center">
          <div className="text-center mb-4">
            <h2 className="fw-bold mb-2">Create Account</h2>
            <p className="text-muted mb-0">
              {step === "email" && "Verify Your Email"}
              {step === "verify" && "Enter OTP"}
              {step === "register" && "Complete Registration"}
            </p>
          </div>

          {msg && (
            <div className="alert alert-danger rounded-3 py-2" role="alert">
              {msg}
            </div>
          )}

          {successMsg && (
            <div className="alert alert-success rounded-3 py-2" role="alert">
              {successMsg}
            </div>
          )}

          {/* STEP 1: Email Entry */}
          {step === "email" && (
            <form onSubmit={handleSendOtp}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Email Address</label>
                <input
                  type="email"
                  className="form-control form-control-lg rounded-3"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </div>

              <div className="d-grid mb-3">
                <button
                  type="submit"
                  className="btn btn-primary btn-lg rounded-3 fw-semibold"
                  disabled={loading}
                >
                  {loading ? "Sending OTP..." : "Send OTP"}
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: OTP Verification */}
          {step === "verify" && (
            <form onSubmit={handleVerifyOtp}>
              <div className="alert alert-info rounded-3" role="alert">
                <small>OTP sent to <strong>{email}</strong></small>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Enter OTP Code (6 digits)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  className="form-control form-control-lg rounded-3 text-center"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  maxLength="6"
                  autoComplete="off"
                  style={{ 
                    fontSize: "28px", 
                    letterSpacing: "8px",
                    fontWeight: "bold",
                    fontFamily: "monospace"
                  }}
                />
                <small className="text-muted d-block mt-2">
                  {otp.length === 6 ? "✓ Code entered" : `${6 - otp.length} digits remaining`}
                </small>
              </div>

              <div className="d-flex gap-2 mb-3">
                <button
                  type="submit"
                  className="btn btn-primary btn-lg rounded-3 fw-semibold flex-grow-1"
                  disabled={loading}
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
              </div>

              <div className="text-center">
                <small className="text-muted">
                  {otpTimer > 0 ? (
                    <>
                      OTP expires in: <strong>{formatTime(otpTimer)}</strong>
                    </>
                  ) : (
                    <>
                      OTP expired.{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setStep("email");
                          setEmail("");
                          setOtp("");
                          setMsg("");
                          setSuccessMsg("");
                        }}
                        className="btn btn-link btn-sm p-0"
                      >
                        Request new OTP
                      </button>
                    </>
                  )}
                </small>
              </div>
            </form>
          )}

          {/* STEP 3: Registration Form */}
          {step === "register" && (
            <form onSubmit={handleRegisterSubmit}>
              <div className="alert alert-success rounded-3 py-2" role="alert">
                <small>✓ Email verified successfully</small>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Full Name</label>
                <input
                  type="text"
                  className="form-control form-control-lg rounded-3"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Email Address</label>
                <input
                  type="email"
                  className="form-control form-control-lg rounded-3"
                  value={form.email}
                  disabled
                  style={{ backgroundColor: "#f0f0f0", cursor: "not-allowed" }}
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Password</label>
                <input
                  type="password"
                  className="form-control form-control-lg rounded-3"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Minimum 6 characters"
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Confirm Password</label>
                <input
                  type="password"
                  className="form-control form-control-lg rounded-3"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                />
              </div>

              <div className="d-grid mb-3">
                <button
                  type="submit"
                  className="btn btn-primary btn-lg rounded-3 fw-semibold"
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create Account"}
                </button>
              </div>
            </form>
          )}

          {step === "register" && (
            <div className="text-center mt-3">
              <span className="text-muted">Already have an account? </span>
              <Link to="/login" className="fw-semibold text-decoration-none">
                Login
              </Link>
            </div>
          )}

          {step !== "register" && (
            <div className="text-center mt-3">
              <span className="text-muted">Already have an account? </span>
              <Link to="/login" className="fw-semibold text-decoration-none">
                Login
              </Link>
            </div>
          )}

          <div className="alert alert-info mt-4 mb-0 rounded-3">
            <b>Note:</b> Admin access is only for the owner. All new users will
            register as candidates.
          </div>
        </div>
      </div>
    </div>
  );
}