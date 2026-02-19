import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginApi } from "../services/api";
import { GoogleLogin } from "@react-oauth/google";
import { googleLoginApi } from "../services/api";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
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

      // backend returns: { token, role, name, email, _id }
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("user", JSON.stringify(res.data));

      // redirect by role
      if (res.data.role === "admin") navigate("/admin");
      else navigate("/candidate");
    } catch (err) {
      setMsg(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: 520 }}>
      <div className="text-center mb-4">
        <h2 className="mb-1">Online Coding Assessment</h2>
        <div className="text-muted">Login to continue</div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-4">
          {msg && <div className="alert alert-danger">{msg}</div>}

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
                placeholder="********"
              />
            </div>

            <button className="btn btn-primary w-100" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="text-center mt-3">
            <span className="text-muted">New user? </span>
            <Link to="/register">Create an account</Link>
          </div>
        </div>
      </div>

      <hr className="my-4" />

      <div className="d-flex justify-content-center">
        <GoogleLogin
          onSuccess={async (credentialResponse) => {
            try {
              setMsg("");
              setLoading(true);

              const res = await googleLoginApi({
                credential: credentialResponse.credential
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
          }}
          onError={() => setMsg("Google login failed")}
        />
      </div>

    </div>
  );
}
