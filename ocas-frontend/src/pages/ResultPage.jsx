import { useLocation, useNavigate } from "react-router-dom";
import ScoreRing from "../components/ScoreRing";

export default function ResultPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning">No result data found.</div>
        <button className="btn btn-primary" onClick={() => navigate("/candidate")}>
          Go Dashboard
        </button>
      </div>
    );
  }

  const copyJSON = async () => {
    await navigator.clipboard.writeText(JSON.stringify(state, null, 2));
    alert("Result JSON copied ✅");
  };

  const passed = state.passedCases ?? 0;
  const total = state.totalCases ?? 0;
  const score = state.score ?? 0;

  return (
    <div className="container py-4">
      {/* Gradient Header */}
      <div className="p-4 rounded-4 shadow-sm mb-4 text-white"
        style={{ background: "linear-gradient(90deg,#4f46e5,#9333ea,#db2777)" }}
      >
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div>
            <h3 className="mb-1 fw-bold">Submission Result</h3>
            <div className="small opacity-75">
              Submission ID: <span className="fw-semibold">{state.submissionId}</span>
            </div>
          </div>

          <div className="d-flex gap-2">
            <button className="btn btn-light btn-sm fw-semibold" onClick={copyJSON}>
              Copy JSON
            </button>
            <button className="btn btn-outline-light btn-sm fw-semibold" onClick={() => navigate("/candidate")}>
              Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        {/* Score Card */}
        <div className="col-md-4">
          <div className="card shadow border-0 rounded-4 h-100">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <div className="text-muted fw-semibold">Score</div>
                <div className="display-6 fw-bold">{score}%</div>
                <span className={`badge fs-6 ${score >= 60 ? "bg-success" : "bg-danger"}`}>
                  {score >= 60 ? "PASSED" : "FAILED"}
                </span>
              </div>
              <div className="text-primary">
                <ScoreRing score={score} size={82} />
              </div>
            </div>
            <div className="card-footer small text-muted">
              Passed {passed}/{total} testcases
            </div>
          </div>
        </div>

        {/* Performance Card */}
        <div className="col-md-4">
          <div className="card shadow border-0 rounded-4 h-100">
            <div className="card-body">
              <div className="text-muted fw-semibold mb-2">Performance</div>
              <div className="progress" style={{ height: 12 }}>
                <div className="progress-bar" style={{ width: `${score}%` }} />
              </div>
              <div className="small text-muted mt-2">
                Target: <b>80%+</b> for strong interview confidence.
              </div>

              <div className="mt-3 p-3 rounded-3"
                style={{ background: "linear-gradient(135deg,#ecfeff,#eef2ff)" }}
              >
                <div className="fw-semibold">Suggestion</div>
                <div className="small text-muted">
                  If failed cases exist, check edge cases + input parsing.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Next Action */}
        <div className="col-md-4">
          <div className="card shadow border-0 rounded-4 h-100">
            <div className="card-body">
              <div className="text-muted fw-semibold">Next Action</div>
              <div className="mt-2 d-grid gap-2">
                <button
                  className="btn btn-gradient fw-semibold"
                  onClick={() => navigate("/candidate")}
                >
                  Take Another Test
                </button>
                <button
                  className="btn btn-outline-secondary fw-semibold"
                  onClick={() => navigate("/attempts")}
                >
                  View My Attempts
                </button>
              </div>
              <div className="small text-muted mt-3">
                Your submission is saved automatically ✅
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-pills gap-2 mb-3" role="tablist">
        <li className="nav-item">
          <button className="nav-link active fw-semibold" data-bs-toggle="tab" data-bs-target="#tab_cases" type="button">
            ✅ Testcases
          </button>
        </li>
        <li className="nav-item">
          <button className="nav-link fw-semibold" data-bs-toggle="tab" data-bs-target="#tab_summary" type="button">
            📌 Summary
          </button>
        </li>
      </ul>

      <div className="tab-content">
        {/* Testcases */}
        <div className="tab-pane fade show active" id="tab_cases">
          <div className="card shadow border-0 rounded-4">
            <div className="card-body">
              <div className="accordion" id="casesAcc">
                {(state.results || []).map((r, idx) => {
                  const ok = r.passed;
                  return (
                    <div className="accordion-item rounded-3 overflow-hidden mb-2" key={idx}>
                      <h2 className="accordion-header">
                        <button
                          className={`accordion-button ${idx === 0 ? "" : "collapsed"}`}
                          data-bs-toggle="collapse"
                          data-bs-target={`#case_${idx}`}
                          type="button"
                        >
                          <div className="d-flex align-items-center gap-2">
                            <span className={`badge fs-6 ${ok ? "bg-success" : "bg-danger"}`}>
                              {ok ? "PASSED" : "FAILED"}
                            </span>
                            <span className="fw-semibold">Testcase {idx + 1}</span>
                            <span className="text-muted small">{r.status || ""}</span>
                          </div>
                        </button>
                      </h2>

                      <div
                        id={`case_${idx}`}
                        className={`accordion-collapse collapse ${idx === 0 ? "show" : ""}`}
                        data-bs-parent="#casesAcc"
                      >
                        <div className="accordion-body">
                          <div className="row g-3">
                            <div className="col-md-4">
                              <div className="small text-muted fw-semibold">Input</div>
                              <pre className="bg-light p-2 rounded">{r.input || "(empty)"}</pre>
                            </div>
                            <div className="col-md-4">
                              <div className="small text-muted fw-semibold">Expected</div>
                              <pre className="bg-light p-2 rounded">{r.expectedOutput}</pre>
                            </div>
                            <div className="col-md-4">
                              <div className="small text-muted fw-semibold">Your Output</div>
                              <pre className="bg-light p-2 rounded">{r.actualOutput || "(empty)"}</pre>
                            </div>
                          </div>

                          <div className="d-flex flex-wrap gap-2 mt-2">
                            <span className="badge text-bg-light">⏱ Time: {r.time ?? "-"}s</span>
                            <span className="badge text-bg-light">💾 Memory: {r.memory ?? "-"} KB</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="tab-pane fade" id="tab_summary">
          <div className="card shadow border-0 rounded-4">
            <div className="card-body">
              <h5 className="fw-bold mb-2">How scoring works</h5>
              <p className="text-muted mb-3">
                Your solution is evaluated against all testcases (including hidden ones).
                Score is based on passed / total.
              </p>

              <div className="row g-3">
                <div className="col-md-6">
                  <div className="p-3 rounded-3 border bg-light">
                    <div className="fw-semibold">✅ Best Practice</div>
                    <ul className="mb-0 small">
                      <li>Use <b>Run</b> to test sample input.</li>
                      <li>Fix compile errors first.</li>
                      <li>Then handle edge cases.</li>
                    </ul>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="p-3 rounded-3 border bg-light">
                    <div className="fw-semibold">🎯 Improve Score</div>
                    <ul className="mb-0 small">
                      <li>Handle empty input & large constraints.</li>
                      <li>Check output formatting.</li>
                      <li>Optimize loops if time limit fails.</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-3 alert alert-info mb-0">
                Tip: If score is low, open failed testcase and compare expected vs your output.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}