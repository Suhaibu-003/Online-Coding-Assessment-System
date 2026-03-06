import { useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, RotateCcw, PartyPopper, Target, Timer, HardDrive } from "lucide-react";
import ScoreRing from "../components/ScoreRing";

export default function ResultPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) return <div className="p-5 text-center">No data found.</div>;

  const score = state.score ?? 0;
  const isPassed = score >= 60;

  // Dynamic colors based on success
  const themeColor = isPassed ? "#10b981" : "#ef4444";
  const bgGradient = isPassed 
    ? "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)" 
    : "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)";

  return (
    <div className="min-vh-100 py-5" style={{ background: bgGradient }}>
      <div className="container" style={{ maxWidth: "900px" }}>
        
        {/* Main Glass Card */}
        <div className="card border-0 shadow-lg rounded-5 overflow-hidden bg-white bg-opacity-75 backdrop-blur">
          <div className="card-body p-4 p-md-5">
            
            {/* Header Section */}
            <div className="text-center mb-5">
              <div className="mb-3 d-inline-block p-3 rounded-circle bg-white shadow-sm">
                <PartyPopper size={40} color={themeColor} />
              </div>
              <h1 className="fw-black display-6 mb-1">Assessment Complete!</h1>
              <p className="text-muted">Submission ID: {state.submissionId?.substring(0, 8)}</p>
            </div>

            {/* Score Display Row */}
            <div className="row g-4 align-items-center mb-5">
              <div className="col-md-6 text-center border-md-end">
                <div className="d-flex justify-content-center mb-3">
                  <ScoreRing score={score} size={160} strokeWidth={10} color={themeColor} />
                </div>
                <h2 className="fw-bold" style={{ color: themeColor }}>{isPassed ? "Great Job!" : "Keep Practicing!"}</h2>
              </div>
              
              <div className="col-md-6 px-md-5">
                <div className="d-flex flex-column gap-3">
                  <StatRow icon={<Target size={20}/>} label="Accuracy" value={`${score}%`} color="primary" />
                  <StatRow icon={<Timer size={20}/>} label="Test Cases" value={`${state.passedCases} / ${state.totalCases}`} color="success" />
                  <StatRow icon={<HardDrive size={20}/>} label="Status" value={isPassed ? "PASSED" : "RETRY"} color={isPassed ? "success" : "danger"} />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
              <button 
                className="btn btn-lg rounded-pill px-5 shadow-sm d-flex align-items-center justify-content-center gap-2"
                style={{ backgroundColor: themeColor, color: 'white', border: 'none' }}
                onClick={() => navigate("/candidate")}
              >
                <RotateCcw size={20} /> Try Another
              </button>
              <button 
                className="btn btn-lg btn-white border-0 shadow-sm rounded-pill px-5 d-flex align-items-center justify-content-center gap-2"
                onClick={() => navigate("/candidate")}
              >
                <LayoutDashboard size={20} /> Dashboard
              </button>
            </div>

          </div>
        </div>

        {/* Simplified Testcase List */}
        <div className="mt-4">
          <h5 className="fw-bold mb-3 px-2">Detailed Results</h5>
          <div className="d-flex flex-column gap-2">
            {(state.results || []).map((r, idx) => (
              <div key={idx} className="bg-white rounded-4 p-3 shadow-sm d-flex align-items-center border-start border-4" style={{ borderColor: r.passed ? '#10b981' : '#ef4444' }}>
                <div className="me-auto fw-bold">Test Case {idx + 1}</div>
                <div className={`badge rounded-pill ${r.passed ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                  {r.passed ? "Passed" : "Failed"}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// Simple Helper Component
function StatRow({ icon, label, value, color }) {
  return (
    <div className="d-flex align-items-center gap-3 p-3 rounded-4 bg-white shadow-sm">
      <div className={`text-${color}`}>{icon}</div>
      <div className="flex-grow-1 text-muted small fw-bold text-uppercase">{label}</div>
      <div className="fw-bold fs-5">{value}</div>
    </div>
  );
}