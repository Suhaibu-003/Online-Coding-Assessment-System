import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getPublishedTestsApi, testSubmissionsApi } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";

export default function AdminDashboard() {
  const [tests, setTests] = useState([]);
  const [selectedTestId, setSelectedTestId] = useState("");
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [err, setErr] = useState("");

  const stats = useMemo(() => {
    const totalSubs = subs.length;
    const completed = subs.filter((s) => s.status === "COMPLETED");
    const avgScore =
      completed.length === 0
        ? 0
        : Math.round(completed.reduce((sum, s) => sum + (s.score || 0), 0) / completed.length);

    const top = completed.length === 0 ? 0 : Math.max(...completed.map((s) => s.score || 0));

    return { totalSubs, completedCount: completed.length, avgScore, top };
  }, [subs]);

  useEffect(() => {
    (async () => {
      try {
        setErr("");
        const tRes = await getPublishedTestsApi(); // reuse /tests list
        const all = tRes.data || [];
        setTests(all);

        const first = all?.[0]?._id || "";
        setSelectedTestId(first);

        if (first) {
          setLoadingSubs(true);
          const sRes = await testSubmissionsApi(first);
          setSubs(sRes.data || []);
          setLoadingSubs(false);
        }
      } catch (e) {
        setErr(e?.response?.data?.message || e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onChangeTest = async (e) => {
    const id = e.target.value;
    setSelectedTestId(id);
    if (!id) {
      setSubs([]);
      return;
    }
    try {
      setErr("");
      setLoadingSubs(true);
      const res = await testSubmissionsApi(id);
      setSubs(res.data || []);
    } catch (e2) {
      setErr(e2?.response?.data?.message || e2.message);
    } finally {
      setLoadingSubs(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-4">
        <div className="card p-3 shadow-sm">
          <LoadingSpinner text="Loading admin dashboard..." />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <h3 className="mb-0">Admin Dashboard</h3>
          <div className="text-muted">Monitor submissions and performance.</div>
        </div>
        <Link to="/admin/create-test" className="btn btn-primary">
          + Create Test
        </Link>
      </div>

      {err && <div className="alert alert-danger">{err}</div>}

      {/* Filter */}
      <div className="card shadow-sm mb-3">
        <div className="card-body d-flex flex-wrap align-items-center justify-content-between gap-2">
          <div className="fw-semibold">Select Test</div>
          <div className="d-flex gap-2 align-items-center" style={{ minWidth: 320 }}>
            <select className="form-select" value={selectedTestId} onChange={onChangeTest}>
              {tests.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>
            <button
              className="btn btn-outline-secondary"
              onClick={() => navigator.clipboard.writeText(selectedTestId)}
              disabled={!selectedTestId}
            >
              Copy ID
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-3">
        <div className="col-md-3">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="text-muted">Total Submissions</div>
              <div className="display-6">{stats.totalSubs}</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="text-muted">Completed</div>
              <div className="display-6">{stats.completedCount}</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="text-muted">Avg Score</div>
              <div className="display-6">{stats.avgScore}%</div>
              <div className="progress mt-2" style={{ height: 10 }}>
                <div className="progress-bar" style={{ width: `${stats.avgScore}%` }} />
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="text-muted">Top Score</div>
              <div className="display-6">{stats.top}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="card shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center">
          <div className="fw-semibold">Submissions</div>
          {loadingSubs && <span className="small text-muted">Loading…</span>}
        </div>

        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Date</th>
                <th>Candidate</th>
                <th>Email</th>
                <th>Question</th>
                <th>Lang</th>
                <th>Status</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {loadingSubs ? (
                <tr>
                  <td colSpan="7" className="p-3">
                    <LoadingSpinner text="Fetching submissions..." />
                  </td>
                </tr>
              ) : subs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-muted p-3">
                    No submissions for this test yet.
                  </td>
                </tr>
              ) : (
                subs.map((s) => (
                  <tr key={s._id}>
                    <td>{new Date(s.createdAt).toLocaleString()}</td>
                    <td>{s.candidate?.name || "-"}</td>
                    <td>{s.candidate?.email || "-"}</td>
                    <td>{s.question?.title || "-"}</td>
                    <td className="text-uppercase">{s.language}</td>
                    <td>
                      <span className={`badge ${s.status === "COMPLETED" ? "text-bg-success" : "text-bg-warning"}`}>
                        {s.status}
                      </span>
                    </td>
                    <td>{s.score ?? 0}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="card-footer text-muted small">
          Tip: Use “Copy ID” to share the test id with teammates (for debugging).
        </div>
      </div>
    </div>
  );
}
