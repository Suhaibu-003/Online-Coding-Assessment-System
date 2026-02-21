import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getPublishedTestsApi, mySubmissionsApi } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";

export default function CandidateDashboard() {
  const navigate = useNavigate();

  const [tests, setTests] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");
  const [sort, setSort] = useState("newest"); // newest | duration | questions

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

  const stats = useMemo(() => {
    const completed = attempts.filter((a) => a.status === "COMPLETED");
    const avgScore =
      completed.length === 0
        ? 0
        : Math.round(completed.reduce((sum, a) => sum + (a.score || 0), 0) / completed.length);

    const best = completed.length === 0 ? 0 : Math.max(...completed.map((a) => a.score || 0));
    return {
      avgScore,
      best,
      completed: completed.length,
      totalAttempts: attempts.length
    };
  }, [attempts]);

  const filteredTests = useMemo(() => {
    const text = q.trim().toLowerCase();
    let arr = [...tests];

    if (text) {
      arr = arr.filter((t) => (t.name || "").toLowerCase().includes(text));
    }

    if (sort === "duration") {
      arr.sort((a, b) => (a.durationMinutes || 0) - (b.durationMinutes || 0));
    } else if (sort === "questions") {
      arr.sort((a, b) => (b.questions?.length || 0) - (a.questions?.length || 0));
    }
    // newest: keep backend order

    return arr;
  }, [tests, q, sort]);

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
      {/* Gradient Header */}
      <div
        className="p-4 rounded-4 shadow-sm mb-4 text-white"
        style={{ background: "linear-gradient(90deg,#4f46e5,#9333ea,#db2777)" }}
      >
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div>
            <h3 className="mb-1 fw-bold">Candidate Dashboard</h3>
            <div className="small opacity-75">
              Search tests • Start coding • Track your performance
            </div>
          </div>

          <div className="d-flex gap-2">
            <Link to="/attempts" className="btn btn-light btn-sm fw-semibold">
              My Attempts
            </Link>
            <button
              className="btn btn-outline-light btn-sm fw-semibold"
              onClick={() => navigate("/candidate")}
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div
            className="card shadow border-0 rounded-4 text-white h-100"
            style={{ background: "linear-gradient(135deg,#2563eb,#06b6d4)" }}
          >
            <div className="card-body">
              <div className="small opacity-75 fw-semibold">Avg Score</div>
              <div className="display-6 fw-bold">{stats.avgScore}%</div>
              <div className="small opacity-75">Completed attempts only</div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div
            className="card shadow border-0 rounded-4 text-white h-100"
            style={{ background: "linear-gradient(135deg,#16a34a,#22c55e)" }}
          >
            <div className="card-body">
              <div className="small opacity-75 fw-semibold">Best Score</div>
              <div className="display-6 fw-bold">{stats.best}%</div>
              <div className="small opacity-75">Your top performance</div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div
            className="card shadow border-0 rounded-4 text-white h-100"
            style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)" }}
          >
            <div className="card-body">
              <div className="small opacity-75 fw-semibold">Completed</div>
              <div className="display-6 fw-bold">{stats.completed}</div>
              <div className="small opacity-75">Evaluated submissions</div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div
            className="card shadow border-0 rounded-4 text-white h-100"
            style={{ background: "linear-gradient(135deg,#111827,#6b7280)" }}
          >
            <div className="card-body">
              <div className="small opacity-75 fw-semibold">Total Attempts</div>
              <div className="display-6 fw-bold">{stats.totalAttempts}</div>
              <div className="small opacity-75">All submissions</div>
            </div>
          </div>
        </div>
      </div>

      {/* Test Explorer */}
      <div className="card shadow border-0 rounded-4 mb-4">
        <div className="card-body">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
            <div>
              <h5 className="fw-bold mb-0">Available Tests</h5>
              <div className="small text-muted">{filteredTests.length} tests found</div>
            </div>

            <div className="d-flex flex-wrap gap-2">
              <input
                className="form-control"
                style={{ width: 260 }}
                placeholder="Search test name…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />

              <select
                className="form-select"
                style={{ width: 190 }}
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="newest">Sort: Newest</option>
                <option value="duration">Sort: Duration</option>
                <option value="questions">Sort: Questions</option>
              </select>
            </div>
          </div>

          {filteredTests.length === 0 ? (
            <div className="alert alert-light border mb-0">
              No tests match your search. Try different keywords.
            </div>
          ) : (
            <div className="row g-3">
              {filteredTests.map((t) => (
                <div className="col-md-6 col-lg-4" key={t._id}>
                  <div className="card h-100 shadow-sm border-0 rounded-4">
                    <div className="card-body d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                        <h5 className="fw-bold mb-0">{t.name}</h5>
                        <span className="badge bg-dark">{t.durationMinutes} mins</span>
                      </div>

                      <div className="d-flex gap-2 mb-3">
                        <span className="badge bg-secondary">
                          {t.questions?.length ?? 0} Questions
                        </span>
                        <span className="badge bg-info text-dark">Practice</span>
                      </div>

                      <div className="mt-auto d-grid gap-2">
                        <button
                          className="btn btn-gradient fw-semibold"
                          onClick={() => navigate(`/test/${t._id}`)}
                        >
                          Start Test
                        </button>
                        <button
                          className="btn btn-outline-secondary fw-semibold"
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
        </div>
      </div>

      {/* Recent Attempts */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 className="fw-bold mb-0">Recent Attempts</h5>
        <Link to="/attempts" className="small">
          View all
        </Link>
      </div>

      {recentAttempts.length === 0 ? (
        <div className="alert alert-light border rounded-4">
          No attempts yet. Start a test to see your history.
        </div>
      ) : (
        <div className="card shadow border-0 rounded-4">
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
                      <span className={`badge ${s.status === "COMPLETED" ? "bg-success" : "bg-warning text-dark"}`}>
                        {s.status}
                      </span>
                    </td>
                    <td>
                      <span className={`badge fs-6 ${Number(s.score || 0) >= 60 ? "bg-success" : "bg-danger"}`}>
                        {s.score ?? 0}%
                      </span>
                    </td>
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