import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getPublishedTestsApi, testSubmissionsApi } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import StatCard from "../components/StatCard";
import ScoreRing from "../components/ScoreRing";

const toCSV = (rows) => {
  const esc = (v) => `"${String(v ?? "").replaceAll('"', '""')}"`;
  const header = ["Date", "Candidate", "Email", "Question", "Language", "Status", "Score"];
  const body = rows.map((s) => [
    new Date(s.createdAt).toLocaleString(),
    s.candidate?.name || "-",
    s.candidate?.email || "-",
    s.question?.title || "-",
    (s.language || "").toUpperCase(),
    s.status || "-",
    `${s.score ?? 0}%`
  ]);
  return [header, ...body].map((r) => r.map(esc).join(",")).join("\n");
};

export default function AdminDashboard() {
  const [tests, setTests] = useState([]);
  const [selectedTestId, setSelectedTestId] = useState("");
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [err, setErr] = useState("");

  const [search, setSearch] = useState("");
  const [onlyCompleted, setOnlyCompleted] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setErr("");
        const tRes = await getPublishedTestsApi();
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

  const filteredSubs = useMemo(() => {
    const text = search.trim().toLowerCase();
    let arr = [...subs];

    if (onlyCompleted) arr = arr.filter((s) => s.status === "COMPLETED");

    if (text) {
      arr = arr.filter((s) => {
        const name = (s.candidate?.name || "").toLowerCase();
        const email = (s.candidate?.email || "").toLowerCase();
        const q = (s.question?.title || "").toLowerCase();
        const lang = (s.language || "").toLowerCase();
        return name.includes(text) || email.includes(text) || q.includes(text) || lang.includes(text);
      });
    }
    return arr;
  }, [subs, search, onlyCompleted]);

  const stats = useMemo(() => {
    const totalSubs = subs.length;
    const completed = subs.filter((s) => s.status === "COMPLETED");
    const avgScore =
      completed.length === 0
        ? 0
        : Math.round(completed.reduce((sum, s) => sum + (s.score || 0), 0) / completed.length);
    const top = completed.length === 0 ? 0 : Math.max(...completed.map((s) => s.score || 0));
    return { totalSubs, completed: completed.length, avgScore, top };
  }, [subs]);

  const exportCSV = () => {
    const csv = toCSV(filteredSubs);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `submissions_${selectedTestId || "test"}.csv`;
    a.click();

    URL.revokeObjectURL(url);
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
          <div className="text-muted">Filter submissions, export reports, track performance.</div>
        </div>
        <Link to="/admin/create-test" className="btn btn-primary">
          + Create Test
        </Link>
      </div>

      {err && <div className="alert alert-danger">{err}</div>}

      {/* Top Controls */}
      <div className="card shadow-sm mb-3">
        <div className="card-body d-flex flex-wrap gap-2 align-items-center justify-content-between">
          <div className="d-flex flex-wrap gap-2 align-items-center">
            <div className="fw-semibold">Test:</div>
            <select className="form-select" style={{ width: 320 }} value={selectedTestId} onChange={onChangeTest}>
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

          <div className="d-flex flex-wrap gap-2 align-items-center">
            <input
              className="form-control"
              style={{ width: 260 }}
              placeholder="Search candidate / email / question / lang…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="form-check">
              <input
                id="onlyCompleted"
                className="form-check-input"
                type="checkbox"
                checked={onlyCompleted}
                onChange={(e) => setOnlyCompleted(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="onlyCompleted">
                Completed only
              </label>
            </div>
            <button className="btn btn-outline-primary" onClick={exportCSV} disabled={filteredSubs.length === 0}>
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-3">
        <div className="col-md-3">
          <StatCard title="Total Submissions" value={stats.totalSubs} />
        </div>
        <div className="col-md-3">
          <StatCard title="Completed" value={stats.completed} subtitle="Evaluated successfully" />
        </div>
        <div className="col-md-3">
          <StatCard
            title="Avg Score"
            value={`${stats.avgScore}%`}
            right={
              <div className="text-primary">
                <ScoreRing score={stats.avgScore} />
              </div>
            }
          />
        </div>
        <div className="col-md-3">
          <StatCard title="Top Score" value={`${stats.top}%`} subtitle="Highest in this test" />
        </div>
      </div>

      {/* Table */}
      <div className="card shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center">
          <div className="fw-semibold">Submissions</div>
          <div className="small text-muted">
            {loadingSubs ? "Loading…" : `${filteredSubs.length} shown`}
          </div>
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
              ) : filteredSubs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-muted p-3">
                    No submissions found for current filters.
                  </td>
                </tr>
              ) : (
                filteredSubs.map((s) => (
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
          Pro tip: Use Search + “Completed only” to quickly filter results.
        </div>
      </div>
    </div>
  );
}