import { useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, RotateCcw, CheckCircle2, XCircle } from "lucide-react";
import ScoreRing from "../components/ScoreRing";

export default function ResultPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="card border-0 shadow-sm rounded-4 p-4 text-center">
          <h4 className="fw-bold mb-2">No result data found</h4>
          <p className="text-muted mb-3">Result details are not available.</p>
          <button
            className="btn btn-primary rounded-3"
            onClick={() => navigate("/candidate")}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const score = state.score ?? 0;

  // All results from backend
  const allResults = Array.isArray(state.results) ? state.results : [];

  // Show ONLY visible testcases
  const results = allResults.filter((r) => !r?.isHidden);

const passedCases = allResults.filter((r) => r?.passed).length;
const totalCases = allResults.length;

  const isPassed = score >= 60;

  return (
    <div
      className="min-vh-100 py-5"
      style={{ background: "linear-gradient(135deg, #f8f9fa, #eef2f7)" }}
    >
      <div className="container" style={{ maxWidth: "900px" }}>
        
        {/* Top Summary */}
        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-body p-4 p-md-5">
            <div className="text-center mb-4">
              <h2 className="fw-bold mb-2">Assessment Result</h2>
              <p className="text-muted mb-0">
                Submission ID: {state.submissionId?.substring(0, 8) || "N/A"}
              </p>
            </div>

            <div className="row align-items-center g-4 mb-4">
              <div className="col-md-5 text-center">
                <div className="d-flex justify-content-center mb-3">
                  <ScoreRing
                    score={score}
                    size={140}
                    strokeWidth={10}
                    color={isPassed ? "#198754" : "#dc3545"}
                  />
                </div>

                <h4 className={`fw-bold ${isPassed ? "text-success" : "text-danger"}`}>
                  {isPassed ? "Passed" : "Needs Improvement"}
                </h4>

                <div className="mt-2">
                  <div className="progress" style={{ height: "8px" }}>
                    <div
                      className={`progress-bar ${isPassed ? "bg-success" : "bg-danger"}`}
                      role="progressbar"
                      style={{ width: `${score}%` }}
                      aria-valuenow={score}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    />
                  </div>
                  <small className="text-muted">Score progress</small>
                </div>
              </div>

              <div className="col-md-7">
                <div className="row g-3">
                  <div className="col-sm-4">
                    <div className="card border-0 bg-light rounded-4 h-100">
                      <div className="card-body text-center">
                        <div className="text-muted small">Score</div>
                        <div className="fw-bold fs-4">{score}%</div>
                      </div>
                    </div>
                  </div>

                  <div className="col-sm-4">
                    <div className="card border-0 bg-light rounded-4 h-100">
                      <div className="card-body text-center">
                        <div className="text-muted small">Passed Cases</div>
                        <div className="fw-bold fs-4">
                          {passedCases}/{totalCases}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-sm-4">
                    <div className="card border-0 bg-light rounded-4 h-100">
                      <div className="card-body text-center">
                        <div className="text-muted small">Status</div>
                        <div
                          className={`fw-bold fs-5 ${
                            isPassed ? "text-success" : "text-danger"
                          }`}
                        >
                          {isPassed ? "PASSED" : "RETRY"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>


            {/* Buttons */}
            <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
              <button
                className="btn btn-primary rounded-3 px-4 d-flex align-items-center gap-2"
                onClick={() => navigate("/candidate")}
              >
                <RotateCcw size={18} />
                Try Another
              </button>

              <button
                className="btn btn-outline-primary rounded-3 px-4 d-flex align-items-center gap-2"
                onClick={() => navigate("/candidate")}
              >
                <LayoutDashboard size={18} />
                Dashboard
              </button>
            </div>
          </div>
        </div>


        {/* Detailed Results */}
        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body p-4">
            <h5 className="fw-bold mb-3">Detailed Results</h5>

            {results.length === 0 ? (
              <div className="text-muted">No testcase details available.</div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {results.map((r, idx) => (
                  <div
                    key={idx}
                    className="card border-0 bg-light rounded-4"
                    style={{
                      borderLeft: `4px solid ${
                        r.passed ? "#198754" : "#dc3545"
                      }`,
                    }}
                  >
                    <div className="card-body">

                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <div className="fw-bold d-flex align-items-center gap-2">
                          {r.passed ? (
                            <CheckCircle2 size={18} className="text-success" />
                          ) : (
                            <XCircle size={18} className="text-danger" />
                          )}
                          Test Case {idx + 1}
                        </div>

                        <span
                          className={`badge rounded-pill px-3 py-2 ${
                            r.passed
                              ? "bg-success-subtle text-success"
                              : "bg-danger-subtle text-danger"
                          }`}
                        >
                          {r.passed ? "Passed" : "Failed"}
                        </span>
                      </div>


                      <div className="row g-3">
                        <div className="col-md-4">
                          <div className="fw-semibold mb-1 text-muted small">
                            Input
                          </div>
                          <pre className="bg-white p-3 rounded-3 mb-0 small">
                            {r.input || "(empty)"}
                          </pre>
                        </div>

                        <div className="col-md-4">
                          <div className="fw-semibold mb-1 text-muted small">
                            Expected
                          </div>
                          <pre className="bg-white p-3 rounded-3 mb-0 small">
                            {r.expectedOutput || "(empty)"}
                          </pre>
                        </div>

                        <div className="col-md-4">
                          <div className="fw-semibold mb-1 text-muted small">
                            Your Output
                          </div>
                          <pre className="bg-white p-3 rounded-3 mb-0 small">
                            {r.actualOutput || "(empty)"}
                          </pre>
                        </div>
                      </div>

                      <div className="small text-muted mt-3 text-end">
                        Time: {r.time ?? "-"}s • Memory: {r.memory ?? "-"} KB
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}