import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerApi, sendOtpApi, verifyOtpApi } from "../services/api";

export default function Register() {
  const navigate = useNavigate();

  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [otpTimer, setOtpTimer] = useState(0);

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
      setSuccessMsg("OTP sent to your email. Check your inbox.");
      setStep("verify");
      setOtpTimer(300);
    } catch (err) {
      setMsg(err?.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

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
      setSuccessMsg("Email verified successfully.");
      setForm((prev) => ({ ...prev, email }));
      setStep("register");
    } catch (err) {
      setMsg(err?.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

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
        password: form.password,
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
    <div className="auth-shell">
      <div className="auth-card">
        <aside className="auth-panel">
          <h1 className="fw-bold mb-3">Create Candidate Account</h1>
          <p className="muted mb-4">
            Secure signup with email verification before access. After registration, your candidate
            dashboard is ready immediately.
          </p>

          <div className="d-flex flex-column gap-3">
            <div>
              <div className="fw-semibold mb-1">Verified onboarding</div>
              <div className="small muted">OTP ensures authentic candidate registrations.</div>
            </div>
            <div>
              <div className="fw-semibold mb-1">Simple assessment access</div>
              <div className="small muted">Browse tests and track attempts from one workspace.</div>
            </div>
            <div>
              <div className="fw-semibold mb-1">Role-secure platform</div>
              <div className="small muted">Admin access remains restricted to owner accounts.</div>
            </div>
          </div>
        </aside>

        <section className="auth-form d-flex flex-column justify-content-center">
          <div className="mb-4">
            <div className="auth-step-label mb-2">Sign Up</div>
            <h2 className="fw-bold mb-1">Create your account</h2>
            <p className="section-subtitle">
              {step === "email" && "Step 1: verify your email"}
              {step === "verify" && "Step 2: enter OTP"}
              {step === "register" && "Step 3: complete registration"}
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

          {step === "email" && (
            <form onSubmit={handleSendOtp}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>

              <div className="d-grid mb-3">
                <button type="submit" className="btn btn-primary py-2" disabled={loading}>
                  {loading ? "Sending OTP..." : "Send OTP"}
                </button>
              </div>
            </form>
          )}

          {step === "verify" && (
            <form onSubmit={handleVerifyOtp}>
              <div className="alert alert-info rounded-3 py-2" role="alert">
                OTP sent to <strong>{email}</strong>
              </div>

              <div className="mb-2">
                <label className="form-label fw-semibold">Enter 6-digit OTP</label>
                <input
                  type="text"
                  inputMode="numeric"
                  className="form-control otp-input"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  maxLength="6"
                  autoComplete="off"
                />
              </div>

              <div className="small section-subtitle mb-3">
                {otp.length === 6 ? "Code entered" : `${6 - otp.length} digits remaining`}
              </div>

              <div className="d-grid mb-3">
                <button type="submit" className="btn btn-primary py-2" disabled={loading}>
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
              </div>

              <div className="text-center section-subtitle">
                {otpTimer > 0 ? (
                  <>
                    OTP expires in <strong>{formatTime(otpTimer)}</strong>
                  </>
                ) : (
                  <>
                    OTP expired.{' '}
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
              </div>
            </form>
          )}

          {step === "register" && (
            <form onSubmit={handleRegisterSubmit}>
              <div className="alert alert-success rounded-3 py-2" role="alert">
                Email verified successfully.
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Email</label>
                <input type="email" className="form-control" value={form.email} disabled />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Password</label>
                <input
                  type="password"
                  className="form-control"
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
                  className="form-control"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                />
              </div>

              <div className="d-grid mb-3">
                <button type="submit" className="btn btn-primary py-2" disabled={loading}>
                  {loading ? "Creating account..." : "Create Account"}
                </button>
              </div>
            </form>
          )}

          <div className="text-center mt-2">
            <span className="section-subtitle">Already have an account? </span>
            <Link to="/login" className="fw-semibold text-decoration-none text-primary">
              Login
            </Link>
          </div>

          <div className="alert alert-info mt-4 mb-0 rounded-3 py-2">
            Admin access is reserved for the owner. New registrations are created as candidates.
          </div>
        </section>
      </div>
    </div>
  );
}
