import { Link, useLocation, useNavigate } from "react-router-dom";
import { isTokenExpired } from "../utils/token";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // Hide navbar on login/register
  const hide =
    location.pathname === "/login" || location.pathname === "/register";
  if (hide) return null;

  // Auto logout if token expired
  if (token && isTokenExpired(token)) {
    localStorage.clear();
    navigate("/login");
    return null;
  }

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const homeLink = role === "admin" ? "/admin" : "/candidate";

  const username = user?.name?.split(" ")[0] || "User";

  return (
    <nav className="navbar navbar-expand-lg bg-white shadow-sm sticky-top border-bottom">
      <div className="container">
        {/* Logo */}
        <Link className="navbar-brand fw-bold text-primary" to={homeLink}>
          CodeBase
        </Link>

        {/* Right Side */}
        <div className="d-flex align-items-center gap-3">
          
          {/* Candidate Only */}
          {role === "candidate" && (
            <Link to="/attempts" className="btn btn-outline-primary btn-sm rounded-3">
              My Attempts
            </Link>
          )}

          {/* Profile */}
          <div className="dropdown">
            <button
              className="btn d-flex align-items-center gap-2 px-3 py-1 rounded-3 border"
              data-bs-toggle="dropdown"
            >
              {/* Avatar Circle */}
              <div
                className="d-flex align-items-center justify-content-center rounded-circle bg-primary text-white"
                style={{ width: "32px", height: "32px", fontSize: "14px" }}
              >
                {username.charAt(0).toUpperCase()}
              </div>

              {/* Name */}
              <span className="fw-semibold">{username}</span>
            </button>

            <ul className="dropdown-menu dropdown-menu-end shadow-sm rounded-3">
              <li className="px-3 py-2">
                <div className="fw-semibold">{user?.name || "-"}</div>
                <div className="small text-muted">{user?.email || "-"}</div>
              </li>

              <li><hr className="dropdown-divider" /></li>

              {role === "admin" && (
                <li>
                  <Link className="dropdown-item" to="/admin">
                    Dashboard
                  </Link>
                </li>
              )}

              {role === "candidate" && (
                <li>
                  <Link className="dropdown-item" to="/candidate">
                    Dashboard
                  </Link>
                </li>
              )}

              <li>
                <button
                  className="dropdown-item text-danger"
                  onClick={logout}
                >
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}