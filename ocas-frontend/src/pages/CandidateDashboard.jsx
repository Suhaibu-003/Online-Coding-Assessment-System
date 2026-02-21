import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getPublishedTestsApi, mySubmissionsApi } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import StatCard from "../components/StatCard";
import ScoreRing from "../components/ScoreRing";


export default function CandidateDashboard() {
  const [tests, setTests] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [difficulty, setDifficulty] = useState("all");
  const [sort, setSort] = useState("newest"); // newest | duration

  useEffect(() => {
    (async () => {
      try {
        const [tRes, aRes] = await Promise.all([getPublishedTestsApi(), mySubmissionsApi()]);
        setTests(tRes.data || []);
        setAttempts(aRes.data || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const stats = useMemo(() => {
    const completed = attempts.filter((a) => a.status === "COMPLETED");
    const avgScore =
      completed.length === 0
        ? 0
        : Math.round(completed.reduce((sum, a) => sum + (a.score || 0), 0) / completed.length);

    const best = completed.length === 0 ? 0 : Math.max(...completed.map((a) => a.score || 0));
    return {
      totalAttempts: attempts.length,
      completed: completed.length,
      avgScore,
      best
    };
  }, [attempts]);

  const filteredTests = useMemo(() => {
    const text = q.trim().toLowerCase();
    let arr = [...tests];

    if (text) {
      arr = arr.filter((t) => (t.name || "").toLowerCase().includes(text));
    }
    if (difficulty !== "all") {
      // if you don't store difficulty on test, this filter will just do nothing
      arr = arr.filter((t) => (t.difficulty || "all").toLowerCase() === difficulty);
    }

    if (sort === "duration") {
      arr.sort((a, b) => (a.durationMinutes || 0) - (b.durationMinutes || 0));
    }
    return arr;
  }, [tests, q, difficulty, sort]);

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
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <h3 className="mb-0">Candidate Dashboard</h3>
          <div className="text-muted">Search tests, practice, and track progress.</div>
        </div>
        <Link to="/attempts" className="btn btn-outline-primary">
          My Attempts
        </Link>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <StatCard title="Avg Score" value={`${stats.avgScore}%`} color="primary" />
        </div>
        <div className="col-md-3">
          <StatCard title="Best Score" value={`${stats.best}%`} color="success" />
        </div>
        <div className="col-md-3">
          <StatCard title="Completed" value={stats.completed} color="warning" />
        </div>
        <div className="col-md-3">
          <StatCard title="Attempts" value={stats.totalAttempts} color="info" />
        </div>
      </div>

      {/* Test Explorer */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
            <div>
              <h5 className="mb-0">Available Tests</h5>
              <div className="small text-muted">{filteredTests.length} tests found</div>
            </div>

            <div className="d-flex flex-wrap gap-2">
              <input
                className="form-control"
                style={{ width: 240 }}
                placeholder="Search by test name…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />

              <select
                className="form-select"
                style={{ width: 160 }}
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="all">All difficulty</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>

              <select
                className="form-select"
                style={{ width: 160 }}
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="newest">Sort: Newest</option>
                <option value="duration">Sort: Duration</option>
              </select>
            </div>
          </div>

          {filteredTests.length === 0 ? (
            <div className="alert alert-light border mb-0">
              No tests match your search. Try clearing filters.
            </div>
          ) : (
            <div className="row g-3">
              {filteredTests.map((t) => (
                <div className="card h-100 shadow border-0 rounded-4">
                  <div className="card-body d-flex flex-column">
                    <h5 className="fw-bold">{t.name}</h5>

                    <div className="d-flex justify-content-between mb-3">
                      <span className="badge bg-secondary">
                        {t.durationMinutes} mins
                      </span>
                      <span className="badge bg-dark">
                        {t.questions?.length} Qs
                      </span>
                    </div>

                    <button
                      className="btn btn-gradient mt-auto"
                      onClick={() => navigate(`/test/${t._id}`)}
                    >
                      Start Test
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Attempts */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 className="mb-0">Recent Attempts</h5>
        <Link to="/attempts" className="small">
          View all
        </Link>
      </div>

      {recentAttempts.length === 0 ? (
        <div className="alert alert-light border">No attempts yet. Start a test to see your progress.</div>
      ) : (
        <div className="card shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Date</th>
                  <th>Test</th>
                  <th>Question</th>
                  <th>Lang</th>
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