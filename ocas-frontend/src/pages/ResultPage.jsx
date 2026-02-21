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

  return (
    <div className="container py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <h3 className="mb-0">Submission Result</h3>
          <div className="text-muted small">Submission ID: {state.submissionId}</div>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary" onClick={copyJSON}>
            Copy Result JSON
          </button>
          <button className="btn btn-outline-primary" onClick={() => navigate("/candidate")}>
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="row g-3 mb-3">
        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <div className="text-muted">Score</div>
                <div className="display-6">{state.score}%</div>
                <div className="small text-muted">Final evaluation</div>
              </div>
              <div className="text-primary">
                <ScoreRing score={state.score} size={72} />
              </div>
            </div>
            <div className="card-footer small text-muted">
              Passed {state.passedCases}/{state.totalCases} testcases
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="text-muted">Performance</div>
              <div className="mt-2">
                <div className="progress" style={{ height: 10 }}>
                  <div className="progress-bar" style={{ width: `${state.score}%` }} />
                </div>
              </div>
              <div className="small text-muted mt-2">
                Aim for 80%+ to be safe in interviews.
              </div>
            </div>
            <div className="card-footer small text-muted">
              Tip: Run sample cases before final submit.
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="text-muted">Next Action</div>
              <div className="mt-2 d-grid gap-2">
                <button className="btn btn-success" onClick={() => navigate("/candidate")}>
                  Take Another Test
                </button>
                <button className="btn btn-outline-secondary" onClick={() => navigate("/attempts")}>
                  View My Attempts
                </button>
              </div>
            </div>
            <div className="card-footer small text-muted">
              Your attempt is saved automatically.
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs" role="tablist">
        <li className="nav-item" role="presentation">
          <button className="nav-link active" data-bs-toggle="tab" data-bs-target="#tab_cases" type="button">
            Testcases
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button className="nav-link" data-bs-toggle="tab" data-bs-target="#tab_summary" type="button">
            Summary
          </button>
        </li>
      </ul>

      <div className="tab-content">
        {/* Testcases */}
        <div className="tab-pane fade show active" id="tab_cases">
          <div className="card shadow-sm border-top-0">
            <div className="card-body">
              <div className="accordion" id="casesAcc">
                {(state.results || []).map((r, idx) => {
                  const ok = r.passed;
                  return (
                    <div className="accordion-item" key={idx}>
                      <h2 className="accordion-header">
                        <button
                          className={`accordion-button ${idx === 0 ? "" : "collapsed"}`}
                          data-bs-toggle="collapse"
                          data-bs-target={`#case_${idx}`}
                          type="button"
                        >
                          <div className="d-flex align-items-center gap-2">
                            <span className={`badge ${ok ? "text-bg-success" : "text-bg-danger"}`}>
                              {ok ? "PASSED" : "FAILED"}
                            </span>
                            <span>Testcase {idx + 1}</span>
                            <span className="text-muted small">
                              {r.status || ""}
                            </span>
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
                              <div className="small text-muted">Input</div>
                              <pre className="bg-light p-2 rounded">{r.input || "(empty)"}</pre>
                            </div>
                            <div className="col-md-4">
                              <div className="small text-muted">Expected</div>
                              <pre className="bg-light p-2 rounded">{r.expectedOutput}</pre>
                            </div>
                            <div className="col-md-4">
                              <div className="small text-muted">Your Output</div>
                              <pre className="bg-light p-2 rounded">{r.actualOutput || "(empty)"}</pre>
                            </div>
                          </div>

                          <div className="d-flex flex-wrap gap-2 mt-2">
                            <span className="badge text-bg-light">Time: {r.time ?? "-"}s</span>
                            <span className="badge text-bg-light">Memory: {r.memory ?? "-"} KB</span>
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
          <div className="card shadow-sm border-top-0">
            <div className="card-body">
              <h5 className="mb-2">How scoring works</h5>
              <p className="text-muted mb-2">
                Your solution is evaluated against all testcases (including hidden).
                Score is based on passed / total.
              </p>
              <ul className="mb-0">
                <li>Use <b>Run</b> for sample cases.</li>
                <li>Use <b>Submit</b> for final evaluation.</li>
                <li>Fix compile errors first, then focus on logic.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}