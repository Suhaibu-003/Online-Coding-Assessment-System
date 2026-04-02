import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginApi, googleLoginApi } from "../services/api";
import { GoogleLogin } from "@react-oauth/google";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!form.email || !form.password) {
      setMsg("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);
      const res = await loginApi(form);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("user", JSON.stringify(res.data));

      if (res.data.role === "admin") navigate("/admin");
      else navigate("/candidate");
    } catch (err) {
      setMsg(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setMsg("");
      setLoading(true);

      const res = await googleLoginApi({
        credential: credentialResponse.credential,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("user", JSON.stringify(res.data));

      if (res.data.role === "admin") navigate("/admin");
      else navigate("/candidate");
    } catch (err) {
      setMsg(err?.response?.data?.message || "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <aside className="auth-panel">
          <h1 className="fw-bold mb-3">Online Coding Assessment</h1>
          <p className="muted mb-4">
            Run coding tests, evaluate submissions, and manage candidate assessments in a clean,
            reliable workspace.
          </p>

          <div className="d-flex flex-column gap-3">
            <div>
              <div className="fw-semibold mb-1">Timed and structured tests</div>
              <div className="small muted">Maintain fairness with focused, time-bound attempts.</div>
            </div>
            <div>
              <div className="fw-semibold mb-1">Role-specific experience</div>
              <div className="small muted">Dedicated views for candidates and administrators.</div>
            </div>
            <div>
              <div className="fw-semibold mb-1">Fast performance review</div>
              <div className="small muted">Inspect test case outcomes and scores quickly.</div>
            </div>
          </div>
        </aside>

        <section className="auth-form d-flex flex-column justify-content-center">
          <div className="mb-4">
            <div className="auth-step-label mb-2">Sign In</div>
            <h2 className="fw-bold mb-1">Welcome back</h2>
            <p className="section-subtitle">Login to continue to your dashboard</p>
          </div>

          {msg && (
            <div className="alert alert-danger rounded-3 py-2" role="alert">
              {msg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Email</label>
              <input
                type="email"
                className="form-control"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Password</label>
              <input
                type="password"
                className="form-control"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>

            <div className="d-grid mb-3">
              <button type="submit" className="btn btn-primary py-2" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </div>
          </form>

          <div className="text-center my-3 section-subtitle">or continue with</div>

          <div className="d-flex justify-content-center mb-3">
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setMsg("Google login failed")} />
          </div>

          <div className="text-center mt-2">
            <span className="section-subtitle">New user? </span>
            <Link to="/register" className="fw-semibold text-decoration-none text-primary">
              Create account
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
