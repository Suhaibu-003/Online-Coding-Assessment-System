import { Link, useLocation, useNavigate } from "react-router-dom";
import { isTokenExpired } from "../utils/token";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const hide = location.pathname === "/login" || location.pathname === "/register";
  if (hide) return null;

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
    <nav className="navbar navbar-expand-lg sticky-top top-nav">
      <div className="container py-2">
        <Link className="navbar-brand brand-logo" to={homeLink}>
          CodeBase
        </Link>

        <div className="d-flex align-items-center gap-2 gap-md-3">
          {role === "candidate" && (
            <Link to="/attempts" className="btn btn-soft btn-sm">
              My Attempts
            </Link>
          )}

          <div className="dropdown">
            <button
              className="btn btn-light border d-flex align-items-center gap-2 px-2 px-md-3"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <span className="avatar-chip">{username.charAt(0).toUpperCase()}</span>
              <span className="fw-semibold d-none d-md-inline">{username}</span>
            </button>

            <ul className="dropdown-menu dropdown-menu-end border-0 shadow rounded-3 mt-2">
              <li className="px-3 py-2">
                <div className="fw-semibold">{user?.name || "-"}</div>
                <div className="small text-muted">{user?.email || "-"}</div>
              </li>

              <li>
                <hr className="dropdown-divider" />
              </li>

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
