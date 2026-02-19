import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3 className="mb-0">My Attempts</h3>
          <div className="text-muted">Your submission history</div>
        </div>
        <Link to="/candidate" className="btn btn-outline-secondary">
          Back
        </Link>
      </div>

      {loading ? (
        <div className="card p-3">
          <LoadingSpinner text="Loading attempts..." />
        </div>
      ) : items.length === 0 ? (
        <div className="alert alert-info">No submissions found.</div>
      ) : (
        <div className="card shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Date</th>
                  <th>Test</th>
                  <th>Question</th>
                  <th>Language</th>
                  <th>Status</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {items.map((s) => (
                  <tr key={s._id}>
                    <td>{new Date(s.createdAt).toLocaleString()}</td>
                    <td>{s.test?.name || "-"}</td>
                    <td>{s.question?.title || "-"}</td>
                    <td className="text-uppercase">{s.language}</td>
                    <td>
                      <span className={`badge ${s.status === "COMPLETED" ? "text-bg-success" : "text-bg-warning"}`}>
                        {s.status}
                      </span>
                    </td>
                    <td>{s.score ?? 0}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
