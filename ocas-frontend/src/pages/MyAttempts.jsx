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
  <div className="min-vh-100 bg-light py-5">
    <div className="container" style={{ maxWidth: "900px" }}>

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">My Attempts</h3>
          <p className="text-muted small mb-0">
            Track your past submissions
          </p>
        </div>

        <Link to="/candidate" className="btn btn-outline-primary rounded-pill px-3">
          <ChevronLeft size={16} /> Back
        </Link>
      </div>

      {/* CONTENT */}
      {loading ? (
        <LoadingSpinner text="Loading..." />
      ) : items.length === 0 ? (
        <div className="card shadow-sm border-0 text-center py-5">
          <h5 className="fw-bold">No attempts yet</h5>
          <p className="text-muted">Start a test to see results here</p>
          <Link to="/candidate" className="btn btn-primary rounded-pill px-4">
            Browse Tests
          </Link>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">

          {items.map((s) => (
            <div key={s._id} className="card shadow-sm border-0 rounded-4">
              <div className="card-body">

                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">

                  {/* LEFT */}
                  <div>
                    <div className="fw-bold">
                      {s.test?.name || "Test"}
                    </div>
                    <div className="text-muted small">
                      {s.question?.title || "Question"}
                    </div>
                    <div className="text-muted small mt-1">
                      {new Date(s.createdAt).toLocaleString()}
                    </div>
                  </div>

                  {/* CENTER */}
                  <div className="text-center">
                    <div className="fw-bold fs-5">
                      {s.score ?? 0}%
                    </div>
                    <span
                      className={`badge ${
                        s.score >= 60 ? "text-bg-success" : "text-bg-warning"
                      }`}
                    >
                      {s.score >= 60 ? "Passed" : "Retry"}
                    </span>
                  </div>

                  {/* RIGHT */}
                  <div className="text-end">
                    <div className="small text-muted mb-1">
                      {s.language?.toUpperCase()}
                    </div>

                    <Link
                      to={`/result/${s._id}`}
                      className="btn btn-sm btn-outline-primary rounded-pill"
                    >
                      View
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