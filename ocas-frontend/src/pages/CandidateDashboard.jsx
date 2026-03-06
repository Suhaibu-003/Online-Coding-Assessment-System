import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Filter, Clock, BookOpen, ChevronRight, Copy, Award, CheckCircle } from "lucide-react";
import { getPublishedTestsApi, mySubmissionsApi } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";

export default function CandidateDashboard() {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("newest");

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
    const avgScore = completed.length === 0 ? 0 : Math.round(completed.reduce((sum, a) => sum + (a.score || 0), 0) / completed.length);
    const best = completed.length === 0 ? 0 : Math.max(...completed.map((a) => a.score || 0));
    return { avgScore, best, completed: completed.length, total: attempts.length };
  }, [attempts]);

  const filteredTests = useMemo(() => {
    let arr = tests.filter(t => (t.name || "").toLowerCase().includes(q.toLowerCase().trim()));
    if (sort === "duration") arr.sort((a, b) => (a.durationMinutes || 0) - (b.durationMinutes || 0));
    if (sort === "questions") arr.sort((a, b) => (b.questions?.length || 0) - (a.questions?.length || 0));
    return arr;
  }, [tests, q, sort]);

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="min-vh-100 bg-light py-5">
      <div className="container">
        
        {/* Header Section */}
        <header className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-5 gap-3">
          <div>
            <h1 className="h3 fw-bold mb-1">Welcome back, Developer</h1>
            <p className="text-secondary mb-0">Track your progress and sharpen your skills with our active assessments.</p>
          </div>
          <Link to="/attempts" className="btn btn-white border shadow-sm px-4">
            View History
          </Link>
        </header>

        {/* Stats Grid */}
        <div className="row g-4 mb-5">
          <StatCard label="Average Score" value={`${stats.avgScore}%`} icon={<Award className="text-primary" />} desc="Based on completed tests" />
          <StatCard label="Best Performance" value={`${stats.best}%`} icon={<CheckCircle className="text-success" />} desc="Highest score achieved" />
          <StatCard label="Tests Finished" value={stats.completed} icon={<BookOpen className="text-info" />} desc="Total evaluations done" />
          <StatCard label="Total Attempts" value={stats.total} icon={<Clock className="text-warning" />} desc="Overall participation" />
        </div>

        {/* Explorer Section */}
        <div className="mb-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
            <h4 className="fw-bold mb-0">Available Assessments</h4>
            <div className="d-flex gap-2 w-100 w-md-auto">
              <div className="input-group bg-white shadow-sm rounded">
                <span className="input-group-text bg-transparent border-0"><Search size={18} /></span>
                <input 
                  type="text" 
                  className="form-control border-0 shadow-none" 
                  placeholder="Search by name..." 
                  value={q} 
                  onChange={(e) => setQ(e.target.value)} 
                />
              </div>
              <select className="form-select border-0 shadow-sm" style={{width: '160px'}} value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="newest">Newest First</option>
                <option value="duration">Fastest</option>
                <option value="questions">Complexity</option>
              </select>
            </div>
          </div>

          <div className="row g-4">
            {filteredTests.length > 0 ? (
              filteredTests.map((t) => (
                <div key={t._id} className="col-md-6 col-lg-4">
                  <div className="card border-0 shadow-sm h-100 transition-hover">
                    <div className="card-body p-4">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <h5 className="fw-bold mb-0">{t.name}</h5>
                        <span className="badge bg-primary-subtle text-primary rounded-pill px-3">
                          {t.durationMinutes} min
                        </span>
                      </div>
                      <p className="text-secondary small mb-4">
                        <BookOpen size={14} className="me-1" /> {t.questions?.length || 0} coding challenges
                      </p>
                      <div className="d-flex gap-2">
                        <button onClick={() => navigate(`/test/${t._id}`)} className="btn btn-primary flex-grow-1 d-flex align-items-center justify-content-center gap-2">
                          Start <ChevronRight size={16} />
                        </button>
                        <button onClick={() => navigator.clipboard.writeText(t._id)} className="btn btn-light" title="Copy ID">
                          <Copy size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12 text-center py-5">
                <div className="text-muted">No tests found matching your criteria.</div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded shadow-sm overflow-hidden mt-5">
          <div className="p-4 border-bottom d-flex justify-content-between align-items-center">
            <h5 className="fw-bold mb-0">Recent Activity</h5>
            <Link to="/attempts" className="text-decoration-none small fw-bold">View all activity &rarr;</Link>
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr className="small text-uppercase text-muted">
                  <th className="px-4 py-3">Date</th>
                  <th>Test / Question</th>
                  <th>Language</th>
                  <th>Status</th>
                  <th className="text-end px-4">Score</th>
                </tr>
              </thead>
              <tbody>
                {attempts.slice(0, 5).map((s) => (
                  <tr key={s._id}>
                    <td className="px-4 text-secondary small">{new Date(s.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="fw-bold text-dark">{s.test?.name || "Deleted Test"}</div>
                      <div className="small text-muted">{s.question?.title || "Multiple"}</div>
                    </td>
                    <td><span className="badge bg-secondary-subtle text-dark border">{s.language}</span></td>
                    <td>
                      <span className={`badge rounded-pill ${s.status === 'COMPLETED' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="text-end px-4 fw-bold text-primary">{s.score ?? 0}%</td>
                  </tr>
                ))}
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
    <div className="col-md-3">
      <div className="card border-0 shadow-sm h-100">
        <div className="card-body">
          <div className="d-flex justify-content-between mb-3">
            <div className="rounded-circle bg-light p-2 d-inline-flex">{icon}</div>
          </div>
          <h3 className="fw-bold mb-1">{value}</h3>
          <div className="text-secondary small fw-medium">{label}</div>
          <div className="text-muted extra-small mt-2" style={{fontSize: '0.75rem'}}>{desc}</div>
        </div>
      </div>
    </div>
  );
}