import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";
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

        const latestPerQuestion = {};
        for (const sub of subsForTest) {
          if (!sub.question?._id) continue;
          const qid = sub.question._id.toString();
          const last = latestPerQuestion[qid];
          const subTime = new Date(sub.createdAt || 0).getTime();
          if (!last || subTime > last.time) {
            latestPerQuestion[qid] = {
              score: sub.score ?? 0,
              time: subTime,
            };
          }
        }

        const obtainedQuestionScore = Object.values(latestPerQuestion).reduce((sum, q) => sum + q.score, 0);
        const totalTestScore = totalQuestions > 0 ? Math.round(obtainedQuestionScore / totalQuestions) : 0;

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
      <div className="page-shell">
        <div className="container" style={{ maxWidth: "760px" }}>
          <div className="surface-card p-4 text-center">
            <h1 className="h5 fw-bold mb-2">No result data found</h1>
            <p className="section-subtitle mb-3">Result details are not available.</p>
            <button className="btn btn-primary" onClick={() => navigate("/candidate")}>Go to Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  const allResults = Array.isArray(state.results) ? state.results : [];
  const results = allResults;

  const passedCases = allResults.filter((r) => r?.passed).length;
  const totalCases = allResults.length;
  const usedScore = computedScore;
  const isPassed = usedScore >= 60;

  return (
    <div className="page-shell">
      <div className="container" style={{ maxWidth: "980px" }}>
        <div className="surface-card mb-4">
          <div className="p-4 p-md-5">
            <div className="text-center mb-4">
              <h1 className="h3 fw-bold mb-2">Assessment Result</h1>
              <p className="section-subtitle mb-0">Submission ID: {state.submissionId?.substring(0, 8) || "N/A"}</p>
            </div>

            <div className="row align-items-center g-4 mb-4">
              <div className="col-md-5 text-center">
                <div className="mb-3 d-inline-flex justify-content-center">
                  <ScoreRing score={score} size={132} stroke={9} color={isPassed ? "#15803d" : "#b91c1c"} />
                </div>
                <h2 className={`h5 fw-bold ${isPassed ? "text-success" : "text-danger"}`}>
                  {isPassed ? "Passed" : "Needs Improvement"}
                </h2>
                <div className="progress mt-2" style={{ height: "7px" }}>
                  <div
                    className={`progress-bar ${isPassed ? "bg-success" : "bg-danger"}`}
                    role="progressbar"
                    style={{ width: `${score}%` }}
                    aria-valuenow={score}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  />
                </div>
                <small className="section-subtitle">Score: {score}%</small>
              </div>

              <div className="col-md-7">
                <div className="row g-3">
                  <MetricBox label="Score" value={`${usedScore}%`} sub={usedScore !== score ? `(Aggregated from ${allSubmissions.length} submissions)` : ""} />
                  <MetricBox label="Results" value={`${passedCases} / ${totalCases}`} sub="Includes hidden cases" />
                  <MetricBox label="Status" value={isPassed ? "PASSED" : "RETRY"} sub="Current assessment outcome" highlight={isPassed ? "success" : "danger"} />
                </div>
              </div>
            </div>

            <div className="d-flex flex-column flex-sm-row gap-2 justify-content-center">
              <button className="btn btn-primary" onClick={() => navigate("/candidate")}>Try Another Test</button>
              <button className="btn btn-outline-secondary" onClick={() => navigate("/candidate")}>Back to Dashboard</button>
            </div>
          </div>
        </div>

        <div className="surface-card">
          <div className="p-4 p-md-5">
            <h2 className="section-title mb-3">Detailed Results</h2>

            {results.length === 0 ? (
              <div className="section-subtitle">No testcase details available.</div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {results.map((r, idx) => (
                  <div
                    key={idx}
                    className="surface-card"
                    style={{ borderLeft: `4px solid ${r.passed ? "#15803d" : "#b91c1c"}` }}
                  >
                    <div className="p-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div className="fw-bold d-flex align-items-center gap-2">
                          {r.passed ? <CheckCircle2 size={17} className="text-success" /> : <XCircle size={17} className="text-danger" />}
                          Test Case {idx + 1}
                        </div>
                        <span className={`badge ${r.passed ? "text-bg-success" : "text-bg-danger"}`}>
                          {r.passed ? "Passed" : "Failed"}
                        </span>
                      </div>

                      <div className="section-subtitle">Time: {r.time ?? "-"}s | Memory: {r.memory ?? "-"} KB</div>
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

function MetricBox({ label, value, sub, highlight }) {
  return (
    <div className="col-sm-4">
      <div className="surface-card h-100">
        <div className="p-3 text-center">
          <div className="metric-label mb-1">{label}</div>
          <div className={`fw-bold fs-5 ${highlight === "success" ? "text-success" : ""} ${highlight === "danger" ? "text-danger" : ""}`}>
            {value}
          </div>
          {sub && <div className="section-subtitle mt-1">{sub}</div>}
        </div>
      </div>
    </div>
  );
}
