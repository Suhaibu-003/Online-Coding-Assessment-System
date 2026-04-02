import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Clock,
  BookOpen,
  ChevronRight,
  Copy,
  Award,
  CheckCircle,
  BarChart3,
  FileText,
} from "lucide-react";
import { getPublishedTestsApi, mySubmissionsApi } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";

export default function CandidateDashboard() {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("newest");
  const [copiedId, setCopiedId] = useState("");

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
      avgScore,
      best,
      completed: completed.length,
      total: attempts.length,
    };
  }, [attempts]);

  const filteredTests = useMemo(() => {
    const completedTestIds = new Set(
      attempts
        .filter((a) => a.status === "COMPLETED")
        .map((a) => a.test?._id)
        .filter(Boolean)
    );

    let arr = tests.filter(
      (t) => (t.name || "").toLowerCase().includes(q.toLowerCase().trim()) && !completedTestIds.has(t._id)
    );

    if (sort === "duration") {
      arr.sort((a, b) => (a.durationMinutes || 0) - (b.durationMinutes || 0));
    }

    if (sort === "questions") {
      arr.sort((a, b) => (b.questionCount || 0) - (a.questionCount || 0));
    }

    return arr;
  }, [tests, q, sort, attempts]);

  const handleCopy = async (id) => {
    await navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(""), 1500);
  };

  if (loading) return <LoadingSpinner fullScreen text="Loading your dashboard..." />;

  const user = JSON.parse(localStorage.getItem("user"));
  const username = user?.name || "User";

  return (
    <div className="page-shell">
      <div className="container">
        <section className="hero-panel mb-4 mb-md-5">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div>
              <h1 className="h3 fw-bold mb-2">Welcome back, {username}</h1>
              <p className="mb-0" style={{ maxWidth: "720px" }}>
                Continue your coding journey with active assessments, fast feedback, and a clear
                performance history.
              </p>
            </div>
            <Link to="/attempts" className="btn btn-light fw-semibold">
              View history
            </Link>
          </div>
        </section>

        <section className="row g-3 g-xl-4 mb-4 mb-md-5">
          <StatMetric
            label="Average Score"
            value={`${stats.avgScore}%`}
            icon={<Award size={18} className="text-primary" />}
            desc="Based on completed tests"
          />
          <StatMetric
            label="Best Performance"
            value={`${stats.best}%`}
            icon={<CheckCircle size={18} className="text-success" />}
            desc="Highest score achieved"
          />
          <StatMetric
            label="Tests Finished"
            value={stats.completed}
            icon={<BookOpen size={18} className="text-info" />}
            desc="Completed assessments"
          />
          <StatMetric
            label="Total Attempts"
            value={stats.total}
            icon={<BarChart3 size={18} className="text-warning" />}
            desc="Participation records"
          />
        </section>

        <section className="surface-card p-3 p-md-4 mb-4">
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
            <div>
              <h2 className="section-title mb-1">Available Assessments</h2>
              <p className="section-subtitle">Choose a test and begin your evaluation.</p>
            </div>

            <div className="d-flex flex-column flex-sm-row gap-2 w-100" style={{ maxWidth: "560px" }}>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search assessment"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>

              <select
                className="form-select"
                style={{ maxWidth: "190px" }}
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="duration">Shortest Duration</option>
                <option value="questions">Most Questions</option>
              </select>
            </div>
          </div>
        </section>

        <section className="row g-3 g-xl-4">
          {filteredTests.length > 0 ? (
            filteredTests.map((t) => (
              <div key={t._id} className="col-md-6 col-xl-4">
                <div className="surface-card surface-card--hover h-100">
                  <div className="p-3 p-md-4 d-flex flex-column h-100">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <h3 className="h6 fw-bold mb-1">{t.name}</h3>
                        <div className="section-subtitle d-flex align-items-center gap-1">
                          <FileText size={14} />
                          {t.questionCount ?? t.questions?.length ?? 0} coding challenges
                        </div>
                      </div>

                      <span className="badge badge-soft-primary px-2 py-2 rounded-pill d-inline-flex align-items-center gap-1">
                        <Clock size={13} />
                        {t.durationMinutes || 0} min
                      </span>
                    </div>

                    <div className="mt-auto d-flex gap-2 pt-2">
                      <button
                        onClick={() => navigate(`/test/${t._id}`)}
                        className="btn btn-primary flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                      >
                        Start Test <ChevronRight size={15} />
                      </button>

                      <button
                        onClick={() => handleCopy(t._id)}
                        className="btn btn-light border"
                        title="Copy Test ID"
                      >
                        <Copy size={15} />
                      </button>
                    </div>

                    {copiedId === t._id && <div className="small text-success fw-semibold mt-2">Test ID copied</div>}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12">
              <div className="empty-state">
                <BookOpen size={36} className="text-muted mb-3" />
                <h3 className="h6 fw-bold">No assessments found</h3>
                <p className="section-subtitle mb-0">Try changing the search or sort option.</p>
              </div>
            </div>
          )}
        </section>

        <section className="surface-card mt-4 mt-md-5 overflow-hidden">
          <div className="p-3 p-md-4 border-bottom d-flex justify-content-between align-items-center">
            <div>
              <h2 className="section-title mb-1">Recent Activity</h2>
              <p className="section-subtitle">Your latest submissions and status.</p>
            </div>
            <Link to="/attempts" className="fw-semibold text-decoration-none text-primary small">
              View all
            </Link>
          </div>

          <div className="table-responsive">
            <table className="table table-modern align-middle">
              <thead>
                <tr>
                  <th className="px-4">Date</th>
                  <th>Assessment</th>
                  <th>Language</th>
                  <th>Status</th>
                  <th className="text-end px-4">Score</th>
                </tr>
              </thead>
              <tbody>
                {attempts.length > 0 ? (
                  attempts.slice(0, 5).map((s) => (
                    <tr key={s._id}>
                      <td className="px-4 section-subtitle">{new Date(s.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="fw-semibold">{s.test?.name || "Deleted Test"}</div>
                        <div className="section-subtitle">{s.question?.title || "Multiple Questions"}</div>
                      </td>
                      <td>
                        <span className="badge rounded-pill text-dark border px-3 py-2 bg-white">{s.language || "N/A"}</span>
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
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-5 section-subtitle">
                      No recent activity available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

function StatMetric({ label, value, icon, desc }) {
  return (
    <div className="col-md-6 col-xl-3">
      <div className="surface-card h-100">
        <div className="p-3 p-md-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <span className="metric-icon">{icon}</span>
          </div>

          <div className="metric-value mb-1">{value}</div>
          <div className="fw-semibold">{label}</div>
          <div className="section-subtitle mt-2">{desc}</div>
        </div>
      </div>
    </div>
  );
}
