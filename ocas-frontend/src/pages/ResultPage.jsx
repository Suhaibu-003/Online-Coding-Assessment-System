import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, RotateCcw, CheckCircle2, XCircle } from "lucide-react";
import ScoreRing from "../components/ScoreRing";
import { mySubmissionsApi } from "../services/api";

export default function ResultPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [allSubmissions, setAllSubmissions] = useState([]);
  const [computedScore, setComputedScore] = useState(state?.score ?? 0);

  const score = state?.score ?? 0;

  useEffect(() => {
    if (!state?.testId) return;

    (async () => {
      try {
        const res = await mySubmissionsApi();
        const subsForTest = (res.data || []).filter(
          (s) => s.test?._id?.toString() === state.testId?.toString() && s.status === "COMPLETED"
        );

        setAllSubmissions(subsForTest);

        const totalQuestions = state.testQuestionCount || subsForTest.length;

        const latestPerQuestion = {}; // questionId -> score
        for (const sub of subsForTest) {
          if (!sub.question?._id) continue;
          const qid = sub.question._id.toString();
          const last = latestPerQuestion[qid];
          const subTime = new Date(sub.createdAt || 0).getTime();
          if (!last || subTime > last.time) {
            latestPerQuestion[qid] = {
              score: sub.score ?? 0,
              time: subTime
            };
          }
        }

        const obtainedQuestionScore = Object.values(latestPerQuestion).reduce(
          (sum, q) => sum + q.score,
          0
        );

        let totalTestScore = 0;
        if (totalQuestions > 0) {
          totalTestScore = Math.round(obtainedQuestionScore / totalQuestions);
        }

        setComputedScore(totalTestScore);
      } catch (e) {
        console.error("Could not compute test score:", e);
      }
    })();
  }, [state?.testId, state?.testQuestionCount, score]);

  useEffect(() => {
    const onPopState = () => {
      navigate("/candidate", { replace: true });
    };

    window.history.pushState(null, null, window.location.href);
    window.addEventListener("popstate", onPopState);

    return () => {
      window.removeEventListener("popstate", onPopState);
    };
  }, [navigate]);

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

  // All results from backend
  const allResults = Array.isArray(state.results) ? state.results : [];

  // Include hidden cases (explicitly requested)
  const results = allResults;

  const passedCases = allResults.filter((r) => r?.passed).length;
  const totalCases = allResults.length;
  const usedScore = computedScore;

  const isPassed = usedScore >= 60;

  return (
    <div className="container py-5" style={{ maxWidth: "900px" }}>
      <div>
        {/* Top Summary */}
        <div className="card mb-4">
          <div className="card-body p-4">
            <div className="text-center mb-4">
              <h2 className="fw-bold mb-2">Assessment Result</h2>
              <p className="text-muted mb-0">
                Submission ID: {state.submissionId?.substring(0, 8) || "N/A"}
              </p>
            </div>

            <div className="row align-items-center g-4 mb-4">
              <div className="col-md-5 text-center">
                <div className="mb-3">
                  <ScoreRing
                    score={score}
                    size={120}
                    strokeWidth={8}
                    color={isPassed ? "#198754" : "#dc3545"}
                  />
                </div>

                <h4 className={`fw-bold ${isPassed ? "text-success" : "text-danger"}`}>
                  {isPassed ? "Passed" : "Needs Improvement"}
                </h4>

                <div className="mt-2">
                  <div className="progress" style={{ height: "6px" }}>
                    <div
                      className={`progress-bar ${isPassed ? "bg-success" : "bg-danger"}`}
                      role="progressbar"
                      style={{ width: `${score}%` }}
                      aria-valuenow={score}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    />
                  </div>
                  <small className="text-muted">Score: {score}%</small>
                </div>
              </div>

              <div className="col-md-7">
                <div className="row g-3">
                  <div className="col-sm-4">
                    <div className="card h-100">
                      <div className="card-body text-center">
                        <div className="text-muted small">Score</div>
                        <div className="fw-bold fs-4">{usedScore}%</div>
                        {usedScore !== score && (
                          <div className="small text-muted">(Aggregated from {allSubmissions.length} submissions)</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="col-sm-4">
                    <div className="card h-100">
                      <div className="card-body text-center">
                        <div className="text-muted small">Results</div>
                        <div className="fw-bold fs-4">{passedCases} / {totalCases} Passed</div>
                        <div className="small text-muted">(includes hidden cases)</div>
                      </div>
                    </div>
                  </div>

                  <div className="col-sm-4">
                    <div className="card h-100">
                      <div className="card-body text-center">
                        <div className="text-muted small">Status</div>
                        <div
                          className={`fw-bold fs-5 ${isPassed ? "text-success" : "text-danger"}`}
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
                className="btn btn-primary"
                onClick={() => navigate("/candidate")}
              >
                Try Another Test
              </button>

              <button
                className="btn btn-outline-secondary"
                onClick={() => navigate("/candidate")}
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Detailed Results */}
        <div className="card">
          <div className="card-body p-4">
            <h5 className="fw-bold mb-3">Detailed Results</h5>

            {results.length === 0 ? (
              <div className="text-muted">No testcase details available.</div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {results.map((r, idx) => (
                  <div
                    key={idx}
                    className="card"
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
                          className={`badge ${
                            r.passed
                              ? "bg-success"
                              : "bg-danger"
                          }`}
                        >
                          {r.passed ? "Passed" : "Failed"}
                        </span>
                      </div>

                      <div className="row g-3 align-items-center">
                        <div className="col-auto">
                          <span className={`badge ${r.passed ? "bg-success" : "bg-danger"}`}>
                            {r.passed ? "Passed" : "Failed"}
                          </span>
                        </div>
                        <div className="col-auto text-muted small">
                          Time: {r.time ?? "-"}s • Memory: {r.memory ?? "-"} KB
                        </div>
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