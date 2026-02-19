import { Navigate } from "react-router-dom";

export const RequireAuth = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
};

export const RequireAdmin = ({ children }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  if (!token) return <Navigate to="/login" replace />;
  return role === "admin" ? children : <Navigate to="/candidate" replace />;
};

export const RequireCandidate = ({ children }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  if (!token) return <Navigate to="/login" replace />;
  return role === "candidate" ? children : <Navigate to="/admin" replace />;
};
