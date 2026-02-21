import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getTestByIdApi, runCodeApi, submitCodeApi } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import CodeEditor from "../components/CodeEditor";

const templates = {
  python: "a,b=map(int,input().split());print(a+b)",
  c: `#include <stdio.h>\nint main(){int a,b;scanf("%d %d",&a,&b);printf("%d",a+b);return 0;}\n`,
  cpp: `#include <iostream>\nusing namespace std;\nint main(){int a,b;cin>>a>>b;cout<<a+b;return 0;}\n`,
  java: `import java.util.*;\npublic class Main{\n  public static void main(String[] args){\n    Scanner sc=new Scanner(System.in);\n    int a=sc.nextInt();\n    int b=sc.nextInt();\n    System.out.print(a+b);\n  }\n}\n`
};

const prettyLang = (l) => (l || "").toUpperCase();

export default function TestPage() {
  const { id } = useParams(); // testId
  const navigate = useNavigate();

  const [test, setTest] = useState(null);
  const [selectedQ, setSelectedQ] = useState(null);

  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(templates.python);

  const [customInput, setCustomInput] = useState("");
  const [runResult, setRunResult] = useState(null); // {stdout, stderr, compile_output, status...}
  const [runText, setRunText] = useState(""); // pretty output text

  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load test
  useEffect(() => {
    (async () => {
      const res = await getTestByIdApi(id);
      setTest(res.data);
      const first = res.data?.questions?.[0] || null;
      setSelectedQ(first);
    })();
  }, [id]);

  // Supported languages per question (fallback)
  const supported = useMemo(
    () => selectedQ?.supportedLanguages || ["c", "cpp", "java", "python"],
    [selectedQ]
  );

  // Keep language valid when question changes
  useEffect(() => {
    if (!selectedQ) return;
    if (!supported.includes(language)) {
      const next = supported[0] || "python";
      setLanguage(next);
      setCode(templates[next] || "");
    }
    // reset run results when switching question
    setRunResult(null);
    setRunText("");
    setCustomInput("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedQ]);

  const visibleCases = useMemo(() => {
    return (selectedQ?.testCases || []).filter((t) => t?.isHidden === false);
  }, [selectedQ]);

  const handlePickCase = (tc) => {
    setCustomInput(tc?.input || "");
    setRunText("");
    setRunResult(null);
  };

  const onChangeLanguage = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    setCode(templates[lang] || "");
    setRunText("");
    setRunResult(null);
  };

  const formatRunOutput = (data) => {
    if (!data) return "";
    const parts = [];
    if (data.compile_output) parts.push("=== Compile Output ===\n" + data.compile_output);
    if (data.stderr) parts.push("=== Stderr ===\n" + data.stderr);
    if (data.stdout) parts.push("=== Stdout ===\n" + data.stdout);
    if (!data.stdout && !data.stderr && !data.compile_output) parts.push("No output");
    return parts.join("\n\n");
  };

  const handleRun = async () => {
    try {
      setRunning(true);
      setRunText("Running...");
      setRunResult(null);

      const res = await runCodeApi({
        language,
        sourceCode: code,
        customInput: customInput || ""
      });

      setRunResult(res.data);
      setRunText(formatRunOutput(res.data));
    } catch (e) {
      setRunText(e?.response?.data?.message || e.message);
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedQ?._id) return;

    try {
      setSubmitting(true);

      const res = await submitCodeApi({
        testId: id,
        questionId: selectedQ._id,
        language,
        sourceCode: code
      });

      navigate("/result", { state: res.data });
    } catch (e) {
      alert(e?.response?.data?.message || e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!test) {
    return (
      <div className="container py-4">
        <div className="card p-3 shadow-sm">
          <LoadingSpinner text="Loading test..." />
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-3">
      {/* Top Bar */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3 px-2">
        <div>
          <div className="d-flex align-items-center gap-2">
            <h4 className="mb-0">{test.name}</h4>
            <span className="badge text-bg-secondary">{test.durationMinutes} mins</span>
          </div>
          <div className="text-muted small">
            Questions: {test.questions?.length || 0} • Language: {prettyLang(language)}
          </div>
        </div>

        <div className="d-flex gap-2">
          <Link className="btn btn-outline-secondary" to="/candidate">
            Back
          </Link>
          <button className="btn btn-success" onClick={handleSubmit} disabled={submitting || running}>
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>

      <div className="row g-3 px-2">
        {/* LEFT PANEL */}
        <div className="col-lg-4 col-xl-3">
          {/* Questions list */}
          <div className="card shadow-sm mb-3">
            <div className="card-header fw-semibold">Questions</div>
            <div className="list-group list-group-flush" style={{ maxHeight: 260, overflowY: "auto" }}>
              {test.questions?.map((q, idx) => (
                <button
                  key={q._id}
                  className={`list-group-item list-group-item-action ${selectedQ?._id === q._id ? "active" : ""
                    }`}
                  onClick={() => setSelectedQ(q)}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="fw-semibold">
                      {idx + 1}. {q.title}
                    </div>
                    <span className="badge text-bg-light">{q.difficulty || "Easy"}</span>
                  </div>
                  <div className="small opacity-75">Click to open</div>
                </button>
              ))}
            </div>
          </div>

          {/* Question + testcases */}
          <div className="card shadow-sm">
            <div className="card-header fw-semibold">Selected Question</div>
            <div className="card-body">
              <h6 className="mb-2">{selectedQ?.title}</h6>
              <p className="text-muted small mb-3" style={{ whiteSpace: "pre-wrap" }}>
                {selectedQ?.statement}
              </p>

              <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="fw-semibold">Sample Testcases</div>
                <span className="small text-muted">{visibleCases.length} shown</span>
              </div>

              {visibleCases.length === 0 ? (
                <div className="alert alert-light border mb-0">No visible testcases.</div>
              ) : (
                <div className="accordion" id="sampleCases">
                  {visibleCases.map((tc, idx) => (
                    <div className="accordion-item" key={idx}>
                      <h2 className="accordion-header">
                        <button
                          className={`accordion-button ${idx === 0 ? "" : "collapsed"}`}
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target={`#case_${idx}`}
                        >
                          Case {idx + 1}
                        </button>
                      </h2>
                      <div
                        id={`case_${idx}`}
                        className={`accordion-collapse collapse ${idx === 0 ? "show" : ""}`}
                        data-bs-parent="#sampleCases"
                      >
                        <div className="accordion-body">
                          <div className="small text-muted">Input</div>
                          <pre className="bg-light p-2 rounded">{tc.input || "(empty)"}</pre>

                          <div className="small text-muted">Expected</div>
                          <pre className="bg-light p-2 rounded">{tc.expectedOutput}</pre>

                          <button
                            className="btn btn-outline-primary btn-sm w-100"
                            onClick={() => handlePickCase(tc)}
                          >
                            Use this input
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="alert alert-warning mt-3 mb-0">
                <b>Tip:</b> Click a testcase → it fills input → click Run.
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="col-lg-8 col-xl-9">
          <div className="card shadow-sm">
            <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
              <div className="fw-semibold">Compiler</div>

              <div className="d-flex gap-2 align-items-center">
                <select className="form-select form-select-sm" value={language} onChange={onChangeLanguage}>
                  {supported.map((l) => (
                    <option key={l} value={l}>
                      {prettyLang(l)}
                    </option>
                  ))}
                </select>

                <button className="btn btn-primary btn-sm" onClick={handleRun} disabled={running || submitting}>
                  {running ? "Running..." : "Run"}
                </button>
              </div>
            </div>

            <div className="card-body">
              {/* Editor */}
              <label className="form-label fw-semibold">Code</label>
              <CodeEditor
                language={
                  language === "c"
                    ? "c"
                    : language === "cpp"
                      ? "cpp"
                      : language === "java"
                        ? "java"
                        : "python"
                }
                code={code}
                setCode={setCode}
              />

              <div className="row g-3 mt-2">
                {/* Input */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Custom Input</label>
                  <textarea
                    className="form-control"
                    rows={5}
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="Paste input here..."
                    style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }}
                  />
                </div>

                {/* Output */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Run Output</label>
                  <textarea
                    className="form-control"
                    rows={5}
                    value={runText}
                    readOnly
                    style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }}
                  />
                </div>
              </div>

              {/* Run meta */}
              {runResult && (
                <div className="mt-3 d-flex flex-wrap gap-2 align-items-center">
                  <span className={`badge ${runResult?.status?.description === "Accepted" ? "text-bg-success" : "text-bg-secondary"}`}>
                    {runResult?.status?.description || "Done"}
                  </span>
                  <span className="badge text-bg-light">Time: {runResult.time ?? "-"}s</span>
                  <span className="badge text-bg-light">Memory: {runResult.memory ?? "-"} KB</span>
                </div>
              )}

              <div className="alert alert-info mt-3 mb-0">
                <b>Submit:</b> runs all hidden testcases and generates final score.
                <br />
                <b>Java:</b> Use <code>public class Main</code>.
              </div>
            </div>

            <div className="card-footer d-flex justify-content-between align-items-center">
              <span className="text-muted small">
                You can Run multiple times. Submit only when ready.
              </span>
              <button className="btn btn-success" onClick={handleSubmit} disabled={submitting || running}>
                {submitting ? "Submitting..." : "Submit Final"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}