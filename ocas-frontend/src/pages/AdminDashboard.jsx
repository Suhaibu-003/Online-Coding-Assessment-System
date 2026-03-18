import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  Copy,
  Download,
  FileText,
  Users,
  Trophy,
  CheckCircle2,
  ClipboardList
} from "lucide-react";
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
  const [copied, setCopied] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const adminName = user?.name?.split(" ")[0] || "Admin";

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

    if (onlyCompleted) {
      arr = arr.filter((s) => s.status === "COMPLETED");
    }

    if (text) {
      arr = arr.filter((s) => {
        const name = (s.candidate?.name || "").toLowerCase();
        const email = (s.candidate?.email || "").toLowerCase();
        const q = (s.question?.title || "").toLowerCase();
        const lang = (s.language || "").toLowerCase();
        return (
          name.includes(text) ||
          email.includes(text) ||
          q.includes(text) ||
          lang.includes(text)
        );
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
        : Math.round(
            completed.reduce((sum, s) => sum + (s.score || 0), 0) / completed.length
          );
    const top =
      completed.length === 0
        ? 0
        : Math.max(...completed.map((s) => s.score || 0));

    const uniqueCandidates = new Set(
      subs.map((s) => s.candidate?.email).filter(Boolean)
    ).size;

    return {
      totalSubs,
      completed: completed.length,
      avgScore,
      top,
      uniqueCandidates
    };
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

  const copyTestId = async () => {
    if (!selectedTestId) return;
    await navigator.clipboard.writeText(selectedTestId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div
      className="min-vh-100 py-5"
      style={{
        background: "linear-gradient(135deg, #f8f9fa, #eef2f7)"
      }}
    >
      <div className="container">
        {/* Top Banner */}
        <div
          className="rounded-4 p-4 p-md-5 mb-5 text-white shadow-sm"
          style={{
            background: "linear-gradient(135deg, #0d6efd, #0a58ca)"
          }}
        >
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div>
              <h1 className="fw-bold mb-2">Welcome back, {adminName}</h1>
              <p className="mb-0 text-white-50" style={{ maxWidth: "760px" }}>
                Manage assessments, review submissions, monitor candidate performance,
                and export reports from one centralized admin dashboard.
              </p>
            </div>

            <Link
              to="/admin/create-test"
              className="btn btn-light fw-semibold px-4 rounded-3 d-inline-flex align-items-center gap-2"
            >
              <Plus size={18} />
              Create Test
            </Link>
          </div>
        </div>

        {err && (
          <div className="alert alert-danger rounded-4 shadow-sm">{err}</div>
        )}

        {/* Stats */}
        <div className="row g-4 mb-5">
          <div className="col-md-6 col-xl-3">
            <StatCard
              title="Total Submissions"
              value={stats.totalSubs}
              subtitle="All records in selected test"
              right={
                <div
                  className="d-inline-flex align-items-center justify-content-center rounded-3"
                  style={{ width: 48, height: 48, background: "#f8f9fa" }}
                >
                  <ClipboardList size={20} className="text-primary" />
                </div>
              }
            />
          </div>

          <div className="col-md-6 col-xl-3">
            <StatCard
              title="Completed"
              value={stats.completed}
              subtitle="Successfully evaluated"
              right={
                <div
                  className="d-inline-flex align-items-center justify-content-center rounded-3"
                  style={{ width: 48, height: 48, background: "#f8f9fa" }}
                >
                  <CheckCircle2 size={20} className="text-success" />
                </div>
              }
            />
          </div>

          <div className="col-md-6 col-xl-3">
            <StatCard
              title="Average Score"
              value={`${stats.avgScore}%`}
              subtitle="Mean score of completed submissions"
              right={<ScoreRing score={stats.avgScore} />}
            />
          </div>

          <div className="col-md-6 col-xl-3">
            <StatCard
              title="Top Score"
              value={`${stats.top}%`}
              subtitle={`${stats.uniqueCandidates} unique candidates`}
              right={
                <div
                  className="d-inline-flex align-items-center justify-content-center rounded-3"
                  style={{ width: 48, height: 48, background: "#f8f9fa" }}
                >
                  <Trophy size={20} className="text-warning" />
                </div>
              }
            />
          </div>
        </div>

        {/* Controls */}
        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-body p-4">
            <div className="row g-3 align-items-end">
              <div className="col-lg-4">
                <label className="form-label fw-semibold">Select Test</label>
                <select
                  className="form-select shadow-sm"
                  value={selectedTestId}
                  onChange={onChangeTest}
                >
                  {tests.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-lg-4">
                <label className="form-label fw-semibold">Search Submissions</label>
                <div className="input-group shadow-sm">
                  <span className="input-group-text bg-white border-end-0">
                    <Search size={18} />
                  </span>
                  <input
                    className="form-control border-start-0"
                    placeholder="Candidate / email / question / language"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="col-lg-4">
                <label className="form-label fw-semibold">Actions</label>
                <div className="d-flex flex-wrap gap-2">
                  <button
                    className="btn btn-outline-secondary d-flex align-items-center gap-2 rounded-3"
                    onClick={copyTestId}
                    disabled={!selectedTestId}
                  >
                    <Copy size={16} />
                    Copy ID
                  </button>

                  <button
                    className="btn btn-outline-primary d-flex align-items-center gap-2 rounded-3"
                    onClick={exportCSV}
                    disabled={filteredSubs.length === 0}
                  >
                    <Download size={16} />
                    Export CSV
                  </button>
                </div>

                {copied && (
                  <div className="text-success small mt-2 fw-medium">
                    Test ID copied
                  </div>
                )}
              </div>
            </div>

            <div className="form-check mt-3">
              <input
                id="onlyCompleted"
                className="form-check-input"
                type="checkbox"
                checked={onlyCompleted}
                onChange={(e) => setOnlyCompleted(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="onlyCompleted">
                Show completed submissions only
              </label>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="card-body p-4 border-bottom d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
            <div>
              <h5 className="fw-bold mb-1">Submission Overview</h5>
              <p className="text-muted small mb-0">
                Monitor candidate performance for the selected assessment
              </p>
            </div>
            <div className="small text-muted">
              {loadingSubs ? "Loading submissions..." : `${filteredSubs.length} result(s) shown`}
            </div>
          </div>

          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead style={{ backgroundColor: "#f8f9fa" }}>
                <tr className="text-muted small text-uppercase">
                  <th className="px-4 py-3">Date</th>
                  <th>Candidate</th>
                  <th>Email</th>
                  <th>Question</th>
                  <th>Language</th>
                  <th>Status</th>
                  <th className="text-end px-4">Score</th>
                </tr>
              </thead>

              <tbody>
                {loadingSubs ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <LoadingSpinner text="Fetching submissions..." />
                    </td>
                  </tr>
                ) : filteredSubs.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">
                      No submissions found for the current filters.
                    </td>
                  </tr>
                ) : (
                  filteredSubs.map((s) => (
                    <tr key={s._id}>
                      <td className="px-4 text-secondary small">
                        {new Date(s.createdAt).toLocaleString()}
                      </td>

                      <td>
                        <div className="fw-semibold text-dark">
                          {s.candidate?.name || "-"}
                        </div>
                      </td>

                      <td className="text-muted small">
                        {s.candidate?.email || "-"}
                      </td>

                      <td>
                        <div className="fw-medium">
                          {s.question?.title || "-"}
                        </div>
                      </td>

                      <td>
                        <span className="badge bg-light text-dark border px-3 py-2 rounded-pill text-uppercase">
                          {s.language || "-"}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`badge rounded-pill px-3 py-2 ${
                            s.status === "COMPLETED"
                              ? "bg-success-subtle text-success"
                              : "bg-warning-subtle text-warning"
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>

                      <td className="text-end px-4 fw-bold text-primary">
                        {s.score ?? 0}%
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="card-footer bg-white text-muted small">
            Pro tip: Use search and completed filter together for faster analysis.
          </div>
        </div>

        {/* Bottom Quick Links */}
        <div className="row g-4 mt-1">
          <div className="col-md-6">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body p-4">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div
                    className="d-inline-flex align-items-center justify-content-center rounded-3"
                    style={{ width: 46, height: 46, background: "#f8f9fa" }}
                  >
                    <FileText size={20} className="text-primary" />
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1">Assessment Management</h6>
                    <p className="text-muted small mb-0">
                      Create and maintain coding tests for candidates
                    </p>
                  </div>
                </div>
                <Link to="/admin/create-test" className="btn btn-primary rounded-3">
                  Go to Create Test
                </Link>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body p-4">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div
                    className="d-inline-flex align-items-center justify-content-center rounded-3"
                    style={{ width: 46, height: 46, background: "#f8f9fa" }}
                  >
                    <Users size={20} className="text-success" />
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1">Candidate Monitoring</h6>
                    <p className="text-muted small mb-0">
                      Review candidate performance and export results
                    </p>
                  </div>
                </div>
                <button
                  className="btn btn-outline-primary rounded-3"
                  onClick={exportCSV}
                  disabled={filteredSubs.length === 0}
                >
                  Export Current Results
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}