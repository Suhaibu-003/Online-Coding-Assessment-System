import { BrowserRouter, useLocation } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes.jsx";
import Navbar from "./components/Navbar.jsx";
import "./App.css";

function AppContent() {
  const location = useLocation();
  const hideNavbar = location.pathname.startsWith("/test/");

  return (
    <div className="app-shell">
      {!hideNavbar && <Navbar />}
      <AppRoutes />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
