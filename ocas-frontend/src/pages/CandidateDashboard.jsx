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
  FileText
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
        const [tRes, aRes] = await Promise.all([
          getPublishedTestsApi(),
          mySubmissionsApi()
        ]);
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
        : Math.round(
            completed.reduce((sum, a) => sum + (a.score || 0), 0) /
              completed.length
          );
    const best =
      completed.length === 0
        ? 0
        : Math.max(...completed.map((a) => a.score || 0));

    return {
      avgScore,
      best,
      completed: completed.length,
      total: attempts.length
    };
  }, [attempts]);

  const filteredTests = useMemo(() => {
    // Get IDs of completed tests
    const completedTestIds = new Set(
      attempts
        .filter((a) => a.status === "COMPLETED")
        .map((a) => a.test?._id)
        .filter(Boolean)
    );

    let arr = tests.filter((t) =>
      (t.name || "").toLowerCase().includes(q.toLowerCase().trim()) &&
      !completedTestIds.has(t._id)
    );

    if (sort === "duration") {
      arr.sort((a, b) => (a.durationMinutes || 0) - (b.durationMinutes || 0));
    }

    if (sort === "questions") {
      arr.sort(
        (a, b) => (b.questionCount || 0) - (a.questionCount || 0)
      );
    }

    return arr;
  }, [tests, q, sort, attempts]);

  const handleCopy = async (id) => {
    await navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(""), 1500);
  };

  if (loading) return <LoadingSpinner fullScreen />;

  const user = JSON.parse(localStorage.getItem("user"));
  const username = user?.name || "User";
  return (
    <div
      className="min-vh-100 py-5"
      style={{
        background: "linear-gradient(135deg, #f8f9fa, #eef2f7)"
      }}
    >
      <div className="container">
        {/* Top Welcome Banner */}
        <div
          className="rounded-4 p-4 p-md-5 mb-5 text-white shadow-sm"
          style={{
            background: "linear-gradient(135deg, #0d6efd, #0a58ca)"
          }}
        >
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div>
              <h1 className="fw-bold mb-2">Welcome back, {username}</h1>
              <p className="mb-0 text-white-50" style={{ maxWidth: "700px" }}>
                Explore active coding assessments, review your performance, and
                continue improving your technical skills through structured
                practice.
              </p>
            </div>
            <Link
              to="/attempts"
              className="btn btn-light fw-semibold px-4 rounded-3"
            >
              View History
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="row g-4 mb-5">
          <StatCard
            label="Average Score"
            value={`${stats.avgScore}%`}
            icon={<Award size={20} className="text-primary" />}
            desc="Based on completed tests"
          />
          <StatCard
            label="Best Performance"
            value={`${stats.best}%`}
            icon={<CheckCircle size={20} className="text-success" />}
            desc="Highest score achieved"
          />
          <StatCard
            label="Tests Finished"
            value={stats.completed}
            icon={<BookOpen size={20} className="text-info" />}
            desc="Successfully completed"
          />
          <StatCard
            label="Total Attempts"
            value={stats.total}
            icon={<BarChart3 size={20} className="text-warning" />}
            desc="All participation records"
          />
        </div>

        {/* Search + Filter */}
        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-body p-4">
            <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
              <div>
                <h4 className="fw-bold mb-1">Available Assessments</h4>
                <p className="text-muted mb-0">
                  Choose a test and start your coding evaluation.
                </p>
              </div>

              <div className="d-flex flex-column flex-sm-row gap-2 w-100" style={{ maxWidth: "520px" }}>
                <div className="input-group shadow-sm">
                  <span className="input-group-text bg-white border-end-0">
                    <Search size={18} />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Search assessment..."
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                </div>

                <select
                  className="form-select shadow-sm"
                  style={{ maxWidth: "180px" }}
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="newest">Newest First</option>
                  <option value="duration">Shortest Duration</option>
                  <option value="questions">Most Questions</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Test Cards */}
        <div className="row g-4">
          {filteredTests.length > 0 ? (
            filteredTests.map((t) => (
              <div key={t._id} className="col-md-6 col-xl-4">
                <div
                  className="card border-0 shadow-sm rounded-4 h-100"
                  style={{ transition: "0.25s ease" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow =
                      "0 .75rem 1.5rem rgba(0,0,0,.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "";
                  }}
                >
                  <div className="card-body p-4 d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <h5 className="fw-bold mb-1">{t.name}</h5>
                        <div className="text-muted small d-flex align-items-center gap-1">
                          <FileText size={14} />
                          {t.questionCount ?? t.questions?.length ?? 0} coding challenges
                        </div>
                      </div>

                      <span className="badge rounded-pill bg-primary-subtle text-primary px-3 py-2">
                        <Clock size={13} className="me-1" />
                        {t.durationMinutes || 0} min
                      </span>
                    </div>

                    <div className="mt-auto">
                      <div className="d-flex gap-2 pt-3">
                        <button
                          onClick={() => navigate(`/test/${t._id}`)}
                          className="btn btn-primary flex-grow-1 d-flex align-items-center justify-content-center gap-2 rounded-3 fw-semibold"
                        >
                          Start Test <ChevronRight size={16} />
                        </button>

                        <button
                          onClick={() => handleCopy(t._id)}
                          className="btn btn-light border rounded-3"
                          title="Copy Test ID"
                        >
                          <Copy size={16} />
                        </button>
                      </div>

                      {copiedId === t._id && (
                        <div className="text-success small mt-2 fw-medium">
                          Test ID copied
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12">
              <div className="card border-0 shadow-sm rounded-4">
                <div className="card-body text-center py-5">
                  <BookOpen size={42} className="text-muted mb-3" />
                  <h5 className="fw-bold">No assessments found</h5>
                  <p className="text-muted mb-0">
                    Try changing the search keyword or filter option.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="card border-0 shadow-sm rounded-4 mt-5 overflow-hidden">
          <div className="card-body p-4 border-bottom d-flex justify-content-between align-items-center">
            <div>
              <h5 className="fw-bold mb-1">Recent Activity</h5>
              <p className="text-muted mb-0 small">
                Your latest submissions and performance summary
              </p>
            </div>
            <Link
              to="/attempts"
              className="text-decoration-none fw-semibold small"
            >
              View all
            </Link>
          </div>

          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead style={{ backgroundColor: "#f8f9fa" }}>
                <tr className="text-muted small text-uppercase">
                  <th className="px-4 py-3">Date</th>
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
                      <td className="px-4 text-secondary small">
                        {new Date(s.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="fw-semibold text-dark">
                          {s.test?.name || "Deleted Test"}
                        </div>
                        <div className="small text-muted">
                          {s.question?.title || "Multiple Questions"}
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border px-3 py-2 rounded-pill">
                          {s.language || "N/A"}
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
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-5 text-muted">
                      No recent activity available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, desc }) {
  return (
    <div className="col-md-6 col-xl-3">
      <div className="card border-0 shadow-sm rounded-4 h-100">
        <div className="card-body p-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-3"
              style={{
                width: "48px",
                height: "48px",
                backgroundColor: "#f8f9fa"
              }}
            >
              {icon}
            </div>
          </div>

          <h3 className="fw-bold mb-1">{value}</h3>
          <div className="text-dark fw-semibold">{label}</div>
          <div className="text-muted small mt-2">{desc}</div>
        </div>
      </div>
    </div>
  );
}