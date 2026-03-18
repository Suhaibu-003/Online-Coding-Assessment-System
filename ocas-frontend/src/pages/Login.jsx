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
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center px-3"
      style={{
        background: "linear-gradient(135deg, #f8f9fa, #e9ecef)",
      }}
    >
      <div className="row w-100 shadow-lg rounded-4 overflow-hidden bg-white" style={{ maxWidth: "950px" }}>
        
        {/* Left Side */}
        <div
          className="col-md-6 d-none d-md-flex flex-column justify-content-center p-5 text-white"
          style={{
            background: "linear-gradient(135deg, #0d6efd, #0a58ca)",
            minHeight: "600px",
          }}
        >
          <h1 className="fw-bold mb-3"> Coding Assessment Platform </h1>
          <p className="mb-4 text-white-50" style={{ lineHeight: "1.8" }}>
            Conduct coding tests, evaluate candidates, and manage assessments
            through one professional platform.
          </p>

          <div className="mt-3">
            <div className="mb-3">
              <h6 className="fw-semibold mb-1">✔ Timed Tests</h6>
              <small className="text-white-50">Secure and structured coding assessments</small>
            </div>
            <div className="mb-3">
              <h6 className="fw-semibold mb-1">✔ Role-Based Access</h6>
              <small className="text-white-50">Separate dashboards for admin and candidate</small>
            </div>
            <div>
              <h6 className="fw-semibold mb-1">✔ Easy Evaluation</h6>
              <small className="text-white-50">Track submissions and performance smoothly</small>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="col-md-6 p-4 p-md-5 d-flex flex-column justify-content-center">
          <div className="text-center mb-4">
            <h2 className="fw-bold mb-2">Welcome Back</h2>
            <p className="text-muted mb-0">Login to continue to your account</p>
          </div>

          {msg && (
            <div className="alert alert-danger rounded-3 py-2" role="alert">
              {msg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Email Address</label>
              <input
                type="email"
                className="form-control form-control-lg rounded-3"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
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
                placeholder="Enter your password"
              />
            </div>

            <div className="d-grid mb-3">
              <button
                type="submit"
                className="btn btn-primary btn-lg rounded-3 fw-semibold"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </div>
          </form>

          <div className="text-center my-3 text-muted" style={{ fontSize: "14px" }}>
            OR
          </div>

          <div className="d-flex justify-content-center mb-3">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setMsg("Google login failed")}
            />
          </div>

          <div className="text-center mt-3">
            <span className="text-muted">New user? </span>
            <Link to="/register" className="fw-semibold text-decoration-none">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}