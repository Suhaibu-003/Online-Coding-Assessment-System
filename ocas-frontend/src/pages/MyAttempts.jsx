import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  ChevronLeft, 
  Calendar, 
  Code2, 
  Trophy, 
  History, 
  CheckCircle2, 
  Clock,
  ArrowRight
} from "lucide-react";
import { mySubmissionsApi } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";

export default function MyAttempts() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await mySubmissionsApi();
        setItems(res.data || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-vh-100 py-5" style={{ background: "linear-gradient(135deg, #f8f9ff 0%, #f1f4ff 100%)" }}>
      <div className="container" style={{ maxWidth: "1000px" }}>
        
        {/* --- HEADER --- */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
          <div className="d-flex align-items-center gap-3">
            <div className="p-3 bg-primary bg-opacity-10 rounded-4 text-primary shadow-sm">
              <History size={28} />
            </div>
            <div>
              <h2 className="fw-bold mb-0">My Attempts</h2>
              <p className="text-muted mb-0 small">Review your coding journey and progress</p>
            </div>
          </div>
          <Link to="/candidate" className="btn btn-white shadow-sm rounded-pill px-4 d-flex align-items-center gap-2">
            <ChevronLeft size={18} /> Back to Dashboard
          </Link>
        </div>

        {/* --- CONTENT --- */}
        {loading ? (
          <div className="text-center py-5"><LoadingSpinner text="Retrieving history..." /></div>
        ) : items.length === 0 ? (
          <div className="card border-0 shadow-sm rounded-5 p-5 text-center bg-white">
            <div className="mb-3 text-muted opacity-25"><Code2 size={64} /></div>
            <h4 className="fw-bold">No attempts yet</h4>
            <p className="text-muted mb-4">Start your first test to see your history here.</p>
            <Link to="/candidate" className="btn btn-primary rounded-pill px-4">Browse Tests</Link>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {items.map((s) => (
              <div key={s._id} className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white hover-up transition-all">
                <div className="card-body p-3 p-md-4">
                  <div className="row align-items-center g-3">
                    
                    {/* Date & Info */}
                    <div className="col-md-3">
                      <div className="d-flex align-items-center gap-2 text-muted small mb-1">
                        <Calendar size={14} /> 
                        {new Date(s.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="d-flex align-items-center gap-2 text-muted small">
                        <Clock size={14} /> 
                        {new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    {/* Test & Question */}
                    <div className="col-md-4 border-md-start border-md-end px-md-4">
                      <div className="fw-bold text-dark mb-1">{s.test?.name || "General Test"}</div>
                      <div className="text-primary small d-flex align-items-center gap-1">
                        <Code2 size={14} /> {s.question?.title || "Untitled Question"}
                      </div>
                    </div>

                    {/* Score & Badge */}
                    <div className="col-md-3">
                      <div className="d-flex align-items-center gap-3">
                        <div className="bg-light p-2 rounded-3">
                           <span className="fw-black text-dark">{s.score ?? 0}%</span>
                        </div>
                        <span className={`badge rounded-pill px-3 py-2 ${s.score >= 60 ? "bg-success-subtle text-success" : "bg-warning-subtle text-warning"}`}>
                          {s.score >= 60 ? "SUCCESS" : "RETRY"}
                        </span>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="col-md-2 text-md-end">
                      <div className="text-muted extra-small text-uppercase fw-bold mb-1 opacity-50">{s.language}</div>
                      <Link to={`/result/${s._id}`} className="text-primary text-decoration-none fw-bold small d-flex align-items-center justify-content-md-end gap-1">
                        Details <ArrowRight size={14} />
                      </Link>
                    </div>

                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}