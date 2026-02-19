import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getPublishedTestsApi, mySubmissionsApi } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";

export default function CandidateDashboard() {
  const [tests, setTests] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  const stats = useMemo(() => {
    const totalAttempts = attempts.length;
    const completed = attempts.filter((a) => a.status === "COMPLETED");
    const avgScore =
      completed.length === 0
        ? 0
        : Math.round(completed.reduce((sum, a) => sum + (a.score || 0), 0) / completed.length);

    return { totalAttempts, completedCount: completed.length, avgScore };
  }, [attempts]);

  useEffect(() => {
    (async () => {
      try {
        const [tRes, aRes] = await Promise.all([getPublishedTestsApi(), mySubmissionsApi()]);
        setTests(tRes.data || []);
        setAttempts(aRes.data || []);
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const recentAttempts = useMemo(() => attempts.slice(0, 6), [attempts]);

  if (loading) {
    return (
      <div className="container py-4">
        <div className="card p-3 shadow-sm">
          <LoadingSpinner text="Loading dashboard..." />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <h3 className="mb-0">Candidate Dashboard</h3>
          <div className="text-muted">Pick a test and start coding.</div>
        </div>
        <Link to="/attempts" className="btn btn-outline-primary">
          View All Attempts
        </Link>
      </div>

      {/* Stats cards */}
      <div className="row g-3 mb-3">
        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="text-muted">Avg Score</div>
              <div className="display-6">{stats.avgScore}%</div>
              <div className="progress mt-2" style={{ height: 10 }}>
                <div className="progress-bar" style={{ width: `${stats.avgScore}%` }} />
              </div>
              <div className="small text-muted mt-2">Based on completed submissions</div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="text-muted">Completed</div>
              <div className="display-6">{stats.completedCount}</div>
              <div className="small text-muted mt-2">Successful evaluations stored</div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="text-muted">Total Attempts</div>
              <div className="display-6">{stats.totalAttempts}</div>
              <div className="small text-muted mt-2">All submissions you made</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tests */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 className="mb-0">Available Tests</h5>
        <span className="text-muted small">{tests.length} tests</span>
      </div>

      {tests.length === 0 ? (
        <div className="alert alert-info">No published tests available.</div>
      ) : (
        <div className="row g-3 mb-4">
          {tests.map((t) => (
            <div className="col-md-6 col-lg-4" key={t._id}>
              <div className="card shadow-sm h-100">
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{t.name}</h5>
                  <div className="text-muted small mb-3">
                    Duration: {t.durationMinutes} mins • Questions: {t.questions?.length ?? "-"}
                  </div>

                  <div className="mt-auto d-grid gap-2">
                    <Link to={`/test/${t._id}`} className="btn btn-primary">
                      Start Test
                    </Link>
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => navigator.clipboard.writeText(t._id)}
                    >
                      Copy Test ID
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent Attempts */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 className="mb-0">Recent Attempts</h5>
        <Link to="/attempts" className="small">
          See all
        </Link>
      </div>

      {recentAttempts.length === 0 ? (
        <div className="alert alert-light border">No attempts yet. Start a test to see your history.</div>
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
                {recentAttempts.map((s) => (
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
