import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Copy,
  Download,
  FileText,
  Users,
  Trophy,
  CheckCircle2,
  ClipboardList,
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
    `${s.score ?? 0}%`,
  ]);
  return [header, ...body].map((r) => r.map(esc).join(",")).join("\n");
};

export default function AdminDashboard() {
  const navigate = useNavigate();
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

    const uniqueCandidates = new Set(subs.map((s) => s.candidate?.email).filter(Boolean)).size;

    return {
      totalSubs,
      completed: completed.length,
      avgScore,
      top,
      uniqueCandidates,
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

  if (loading) return <LoadingSpinner fullScreen text="Loading admin dashboard..." />;

  return (
    <div className="page-shell">
      <div className="container">
        <section className="hero-panel mb-4 mb-md-5">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div>
              <h1 className="h3 fw-bold mb-2">Welcome back, {adminName}</h1>
              <p className="mb-0" style={{ maxWidth: "760px" }}>
                Manage assessments, review candidate performance, and export submission data from
                one professional admin console.
              </p>
            </div>

            <Link to="/admin/create-test" className="btn btn-light fw-semibold d-inline-flex align-items-center gap-2">
              <Plus size={16} /> Create Test
            </Link>
          </div>
        </section>

        {err && <div className="alert alert-danger rounded-3">{err}</div>}

        <section className="row g-3 g-xl-4 mb-4 mb-md-5">
          <div className="col-md-6 col-xl-3">
            <StatCard
              title="Total Submissions"
              value={stats.totalSubs}
              subtitle="Records in selected test"
              right={<span className="metric-icon"><ClipboardList size={18} className="text-primary" /></span>}
            />
          </div>
          <div className="col-md-6 col-xl-3">
            <StatCard
              title="Completed"
              value={stats.completed}
              subtitle="Successfully evaluated"
              right={<span className="metric-icon"><CheckCircle2 size={18} className="text-success" /></span>}
            />
          </div>
          <div className="col-md-6 col-xl-3">
            <StatCard
              title="Average Score"
              value={`${stats.avgScore}%`}
              subtitle="Completed submissions"
              right={<ScoreRing score={stats.avgScore} />}
            />
          </div>
          <div className="col-md-6 col-xl-3">
            <StatCard
              title="Top Score"
              value={`${stats.top}%`}
              subtitle={`${stats.uniqueCandidates} unique candidates`}
              right={<span className="metric-icon"><Trophy size={18} className="text-warning" /></span>}
            />
          </div>
        </section>

        <section className="surface-card p-3 p-md-4 mb-4">
          <div className="row g-3 align-items-end">
            <div className="col-lg-4">
              <label className="form-label fw-semibold">Select Test</label>
              <select className="form-select" value={selectedTestId} onChange={onChangeTest}>
                {tests.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-lg-4">
              <label className="form-label fw-semibold">Search Submissions</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <Search size={16} />
                </span>
                <input
                  className="form-control border-start-0"
                  placeholder="Candidate, email, question, language"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="col-lg-4">
              <label className="form-label fw-semibold">Actions</label>
              <div className="d-flex flex-wrap gap-2">
                <button
                  className="btn btn-outline-primary d-flex align-items-center gap-2"
                  onClick={() => navigate(`/admin/schedule-test/${selectedTestId}`)}
                  disabled={!selectedTestId}
                >
                  <Users size={15} /> Schedule
                </button>

                <button className="btn btn-outline-secondary d-flex align-items-center gap-2" onClick={copyTestId} disabled={!selectedTestId}>
                  <Copy size={15} /> Copy ID
                </button>

                <button className="btn btn-outline-primary d-flex align-items-center gap-2" onClick={exportCSV} disabled={filteredSubs.length === 0}>
                  <Download size={15} /> Export CSV
                </button>
              </div>

              {copied && <div className="small text-success fw-semibold mt-2">Test ID copied</div>}
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
        </section>

        <section className="surface-card overflow-hidden">
          <div className="p-3 p-md-4 border-bottom d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
            <div>
              <h2 className="section-title mb-1">Submission Overview</h2>
              <p className="section-subtitle">Monitor performance for the selected assessment.</p>
            </div>
            <div className="section-subtitle">
              {loadingSubs ? "Loading submissions..." : `${filteredSubs.length} result(s) shown`}
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-modern align-middle">
              <thead>
                <tr>
                  <th className="px-4">Date</th>
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
                    <td colSpan="7" className="text-center py-5 section-subtitle">
                      No submissions found for the current filters.
                    </td>
                  </tr>
                ) : (
                  filteredSubs.map((s) => (
                    <tr key={s._id}>
                      <td className="px-4 section-subtitle">{new Date(s.createdAt).toLocaleString()}</td>
                      <td className="fw-semibold">{s.candidate?.name || "-"}</td>
                      <td className="section-subtitle">{s.candidate?.email || "-"}</td>
                      <td>{s.question?.title || "-"}</td>
                      <td>
                        <span className="badge rounded-pill border bg-white text-dark px-3 py-2 text-uppercase">
                          {s.language || "-"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge rounded-pill px-3 py-2 ${
                            s.status === "COMPLETED" ? "badge-soft-success" : "badge-soft-warning"
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="text-end px-4 fw-bold text-primary">{s.score ?? 0}%</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="row g-3 g-xl-4 mt-1">
          <div className="col-md-6">
            <div className="surface-card h-100">
              <div className="p-3 p-md-4">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <span className="metric-icon"><FileText size={18} className="text-primary" /></span>
                  <div>
                    <h3 className="h6 fw-bold mb-1">Assessment Management</h3>
                    <p className="section-subtitle mb-0">Create and maintain coding assessments.</p>
                  </div>
                </div>
                <Link to="/admin/create-test" className="btn btn-primary">
                  Go to Create Test
                </Link>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="surface-card h-100">
              <div className="p-3 p-md-4">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <span className="metric-icon"><Users size={18} className="text-success" /></span>
                  <div>
                    <h3 className="h6 fw-bold mb-1">Candidate Monitoring</h3>
                    <p className="section-subtitle mb-0">Export filtered result sets for reporting.</p>
                  </div>
                </div>
                <button className="btn btn-outline-primary" onClick={exportCSV} disabled={filteredSubs.length === 0}>
                  Export Current Results
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
