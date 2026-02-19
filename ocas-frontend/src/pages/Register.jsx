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
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
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

      // ✅ send only name, email, password (no role)
      const res = await registerApi({
        name: form.name,
        email: form.email,
        password: form.password
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("user", JSON.stringify(res.data));

      // ✅ user will be candidate
      navigate("/candidate");
    } catch (err) {
      setMsg(err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: 520 }}>
      <div className="text-center mb-4">
        <h2 className="mb-1">Create Account</h2>
        <div className="text-muted">Register to start using OCA</div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-4">
          {msg && <div className="alert alert-danger">{msg}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Name</label>
              <input
                className="form-control"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your name"
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Email</label>
              <input
                type="email"
                className="form-control"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
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
                placeholder="min 6 characters"
              />
            </div>

            <button className="btn btn-success w-100" disabled={loading}>
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>

          <div className="text-center mt-3">
            <span className="text-muted">Already have account? </span>
            <Link to="/login">Login</Link>
          </div>

          <div className="alert alert-info mt-3 mb-0">
            <b>Note:</b> Admin access is only for the owner. Others will always register as candidates.
          </div>
        </div>
      </div>
    </div>
  );
}
