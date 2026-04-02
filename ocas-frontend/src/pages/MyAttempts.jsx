import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, BookOpen, History } from "lucide-react";
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
    <div className="page-shell">
      <div className="container" style={{ maxWidth: "940px" }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h4 fw-bold mb-1">My Attempts</h1>
            <p className="section-subtitle mb-0">Track all your past submissions and scores.</p>
          </div>

          <Link to="/candidate" className="btn btn-outline-primary d-inline-flex align-items-center gap-1">
            <ChevronLeft size={15} /> Back
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading attempts..." />
        ) : items.length === 0 ? (
          <div className="empty-state">
            <BookOpen size={34} className="text-muted mb-3" />
            <h2 className="h6 fw-bold">No attempts yet</h2>
            <p className="section-subtitle">Start a test to see your attempt history here.</p>
            <Link to="/candidate" className="btn btn-primary mt-1">
              Browse Tests
            </Link>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {items.map((s) => (
              <div key={s._id} className="surface-card surface-card--hover">
                <div className="p-3 p-md-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
                  <div>
                    <div className="fw-bold">{s.test?.name || "Test"}</div>
                    <div className="section-subtitle">{s.question?.title || "Question"}</div>
                    <div className="section-subtitle mt-1 d-flex align-items-center gap-1">
                      <History size={13} />
                      {new Date(s.createdAt).toLocaleString()}
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="metric-value" style={{ fontSize: "1.45rem" }}>
                      {s.score ?? 0}%
                    </div>
                    <span className={`badge rounded-pill px-3 py-2 ${s.score >= 60 ? "badge-soft-success" : "badge-soft-warning"}`}>
                      {s.score >= 60 ? "Passed" : "Retry"}
                    </span>
                  </div>

                  <div className="text-end">
                    <div className="section-subtitle mb-1">{s.language?.toUpperCase()}</div>
                    <Link to={`/result/${s._id}`} className="btn btn-sm btn-outline-primary">
                      View
                    </Link>
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
