export default function ResultCard({ result, index }) {
  const ok = result.passed;
  return (
    <div className={`card mb-3 border ${ok ? "border-success" : "border-danger"}`}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center">
          <h6 className="mb-0">
            Testcase {index + 1} — {ok ? "✅ Passed" : "❌ Failed"}
          </h6>
          <span className={`badge ${ok ? "text-bg-success" : "text-bg-danger"}`}>
            {result.status || (ok ? "Accepted" : "Failed")}
          </span>
        </div>

        <hr />

        <div className="row g-3">
          <div className="col-md-4">
            <div className="fw-semibold">Input</div>
            <pre className="bg-light p-2 rounded mb-0">{result.input || "(empty)"}</pre>
          </div>
          <div className="col-md-4">
            <div className="fw-semibold">Expected</div>
            <pre className="bg-light p-2 rounded mb-0">{result.expectedOutput}</pre>
          </div>
          <div className="col-md-4">
            <div className="fw-semibold">Your Output</div>
            <pre className="bg-light p-2 rounded mb-0">{result.actualOutput || "(empty)"}</pre>
          </div>
        </div>

        <div className="small text-muted mt-2">
          Time: {result.time ?? "-"}s • Memory: {result.memory ?? "-"} KB
        </div>
      </div>
    </div>
  );
}
 