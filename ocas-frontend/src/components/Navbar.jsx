import { Link, useLocation, useNavigate } from "react-router-dom";
import { isTokenExpired } from "../utils/token";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // Hide navbar on login/register pages
  const hide = location.pathname === "/login" || location.pathname === "/register";
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

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
      <div className="container">
        <Link className="navbar-brand fw-bold" to={homeLink}>
          OCA
        </Link>

        <div className="d-flex align-items-center gap-2">
          {role === "candidate" && (
            <Link to="/attempts" className="btn btn-outline-light btn-sm">
              My Attempts
            </Link>
          )}

          {/* Profile Dropdown */}
          <div className="dropdown">
            <button
              className="btn btn-outline-light btn-sm dropdown-toggle"
              data-bs-toggle="dropdown"
            >
              {user?.name || "Profile"}{" "}
              <span className="badge text-bg-secondary ms-1">{role}</span>
            </button>

            <ul className="dropdown-menu dropdown-menu-end">
              <li className="dropdown-item-text">
                <div className="fw-semibold">{user?.name || "-"}</div>
                <div className="small text-muted">{user?.email || "-"}</div>
              </li>
              <li><hr className="dropdown-divider" /></li>

              {/* Hide admin link for candidate */}
              {role === "admin" && (
                <li>
                  <Link className="dropdown-item" to="/admin">
                    Admin Dashboard
                  </Link>
                </li>
              )}

              {role === "candidate" && (
                <li>
                  <Link className="dropdown-item" to="/candidate">
                    Candidate Dashboard
                  </Link>
                </li>
              )}

              <li>
                <button className="dropdown-item text-danger" onClick={logout}>
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
