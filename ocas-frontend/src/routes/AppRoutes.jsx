import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login.jsx";
import Register from "../pages/Register.jsx";
import CandidateDashboard from "../pages/CandidateDashboard.jsx";
import AdminDashboard from "../pages/AdminDashboard.jsx";
import CreateTest from "../pages/CreateTest.jsx";
import TestPage from "../pages/TestPage.jsx";
import ResultPage from "../pages/ResultPage.jsx";
import MyAttempts from "../pages/MyAttempts.jsx";

import { RequireAdmin, RequireCandidate, RequireAuth } from "../components/RoleRoutes.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Candidate */}
      <Route
        path="/candidate"
        element={
          <RequireCandidate>
            <CandidateDashboard />
          </RequireCandidate>
        }
      />
      <Route
        path="/attempts"
        element={
          <RequireCandidate>
            <MyAttempts />
          </RequireCandidate>
        }
      />
      <Route
        path="/test/:id"
        element={
          <RequireCandidate>
            <TestPage />
          </RequireCandidate>
        }
      />
      <Route
        path="/result"
        element={
          <RequireAuth>
            <ResultPage />
          </RequireAuth>
        }
      />

      {/* Admin */}
      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminDashboard />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/create-test"
        element={
          <RequireAdmin>
            <CreateTest />
          </RequireAdmin>
        }
      />

      <Route path="*" element={<div className="container py-5">404</div>} />
    </Routes>
  );
}
