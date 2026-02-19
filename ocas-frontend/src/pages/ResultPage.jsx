import { useLocation, useNavigate } from "react-router-dom";
import ResultCard from "../components/ResultCard";

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

  return (
    <div className="container py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <h3 className="mb-0">Result</h3>
          <div className="text-muted">Your submission evaluation report</div>
        </div>
        <button className="btn btn-outline-primary" onClick={() => navigate("/candidate")}>
          Back to Dashboard
        </button>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="text-muted">Score</div>
              <div className="display-6">{state.score}%</div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="text-muted">Passed</div>
              <div className="display-6">
                {state.passedCases}/{state.totalCases}
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="text-muted">Submission</div>
              <div className="small">ID: {state.submissionId}</div>
            </div>
          </div>
        </div>
      </div>

      <h5 className="mb-2">Testcase Details</h5>
      {state.results?.map((r, idx) => (
        <ResultCard key={idx} result={r} index={idx} />
      ))}
    </div>
  );
}
