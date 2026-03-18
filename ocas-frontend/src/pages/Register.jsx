import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerApi } from "../services/api";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!form.name || !form.email || !form.password) {
      setMsg("Please fill all fields.");
      return;
    }

    if (form.password.length < 6) {
      setMsg("Password must be at least 6 characters.");
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
              <h6 className="fw-semibold mb-1">✔ Easy Registration</h6>
              <small className="text-white-50">
                Create your account in just a few seconds
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
            <p className="text-muted mb-0">Register to Start Coding</p>
          </div>

          {msg && (
            <div className="alert alert-danger rounded-3 py-2" role="alert">
              {msg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
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
                placeholder="Minimum 6 characters"
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

          <div className="text-center mt-3">
            <span className="text-muted">Already have an account? </span>
            <Link to="/login" className="fw-semibold text-decoration-none">
              Login
            </Link>
          </div>

          <div className="alert alert-info mt-4 mb-0 rounded-3">
            <b>Note:</b> Admin access is only for the owner. All new users will
            register as candidates.
          </div>
        </div>
      </div>
    </div>
  );
}