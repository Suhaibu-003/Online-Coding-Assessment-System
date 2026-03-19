import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ChevronLeft,
  Play,
  Send,
  BookText,
  Terminal,
  Cpu,
  Layers
} from "lucide-react";
import { getTestByIdApi, runCodeApi, submitCodeApi } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import CodeEditor from "../components/CodeEditor";

const templates = {
  python: "a,b=map(int,input().split())\nprint(a+b)",
  c: `#include <stdio.h>

int main() {
    int a, b;
    if (scanf("%d %d", &a, &b) == 2) {
        printf("%d", a + b);
    }
    return 0;
}
`,
  cpp: `#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    cout << a + b;
    return 0;
}
`,
  java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        System.out.print(a + b);
    }
}
`
};

export default function TestPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [test, setTest] = useState(null);
  const [selectedQ, setSelectedQ] = useState(null);
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(templates.python);
  const [customInput, setCustomInput] = useState("");
  const [runResult, setRunResult] = useState(null);
  const [runText, setRunText] = useState("");
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("console");
  const [copiedMsg, setCopiedMsg] = useState("");

  useEffect(() => {
    (async () => {
      const res = await getTestByIdApi(id);
      setTest(res.data);
      setSelectedQ(res.data?.questions?.[0] || null);
    })();
  }, [id]);

  const supported = useMemo(() => {
  const langs = selectedQ?.supportedLanguages || ["c", "cpp", "java", "python"];
  return langs.filter((l) => l !== "javascript");
}, [selectedQ]);

  useEffect(() => {
    if (!selectedQ) return;

    if (!supported.includes(language)) {
      const next = supported[0] || "python";
      setLanguage(next);
      setCode(templates[next] || "");
    }

    setRunResult(null);
    setRunText("");
    setCustomInput("");
  }, [selectedQ]);

  const visibleCases = useMemo(
    () => (selectedQ?.testCases || []).filter((t) => !t?.isHidden),
    [selectedQ]
  );

  const handleRun = async () => {
    try {
      setRunning(true);
      setRunText("Processing...");
      const res = await runCodeApi({
        language,
        sourceCode: code,
        customInput: customInput || ""
      });
      setRunResult(res.data);
      setRunText(
        res.data.stdout ||
          res.data.stderr ||
          res.data.compile_output ||
          "Execution completed (no output)."
      );
    } catch (e) {
      setRunText(e?.response?.data?.message || e.message);
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (
      !selectedQ?._id ||
      !window.confirm(
        "Are you sure you want to submit? This will end your attempt for this question."
      )
    ) {
      return;
    }

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

  const copyToInput = (value) => {
    setCustomInput(value);
    setCopiedMsg("Copied to input");
    setTimeout(() => setCopiedMsg(""), 1200);
  };

  if (!test) return <LoadingSpinner fullScreen />;

  return (
    <div
      className="min-vh-100 d-flex flex-column"
      style={{ background: "linear-gradient(135deg, #f8f9fa, #eef2f7)" }}
    >
      {/* Top Bar */}
      <div className="bg-white border-bottom shadow-sm">
        <div className="container-fluid px-3 px-lg-4 py-3 d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
          <div className="d-flex align-items-center gap-3">
            <Link to="/candidate" className="btn btn-outline-primary rounded-3 d-flex align-items-center gap-2">
              <ChevronLeft size={16} />
              Exit
            </Link>

            <div>
              <h5 className="mb-1 fw-bold">{test.name}</h5>
              <div className="text-muted small">{selectedQ?.title || "Loading question..."}</div>
            </div>
          </div>

          <div className="d-flex flex-wrap align-items-center gap-2">
            <div className="badge bg-light text-dark border px-3 py-2 rounded-pill">
              Duration: {test.durationMinutes || 0} min
            </div>

            <button
              className="btn btn-outline-primary rounded-3 d-flex align-items-center gap-2"
              onClick={handleRun}
              disabled={running}
            >
              <Play size={16} />
              {running ? "Running..." : "Run"}
            </button>

            <button
              className="btn btn-primary rounded-3 d-flex align-items-center gap-2"
              onClick={handleSubmit}
              disabled={submitting}
            >
              <Send size={16} />
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="container-fluid px-3 px-lg-4 py-4 flex-grow-1">
        <div className="row g-4 h-100">
          {/* Left Side */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body p-4" style={{ maxHeight: "calc(100vh - 170px)", overflowY: "auto" }}>
                <div className="d-flex align-items-center gap-2 mb-3 text-primary">
                  <BookText size={18} />
                  <span className="fw-bold">Problem Statement</span>
                </div>

                <h4 className="fw-bold mb-3">{selectedQ?.title}</h4>

                <div className="d-flex gap-2 mb-4">
                  <span className="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill">
                    {selectedQ?.difficulty || "Medium"}
                  </span>
                  <span className="badge bg-light text-dark border px-3 py-2 rounded-pill">
                    Score: 100
                  </span>
                </div>

                <div
                  className="mb-5 text-dark"
                  style={{ whiteSpace: "pre-wrap", lineHeight: "1.8" }}
                >
                  {selectedQ?.statement}
                </div>

                <div className="d-flex align-items-center gap-2 mb-3 text-primary">
                  <Layers size={18} />
                  <span className="fw-bold">Example Test Cases</span>
                </div>

                {visibleCases.length === 0 ? (
                  <div className="text-muted small">No visible test cases available.</div>
                ) : (
                  visibleCases.map((tc, idx) => (
                    <div key={idx} className="card border-0 bg-light rounded-4 mb-3">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="fw-semibold">Example {idx + 1}</span>
                          <button
                            className="btn btn-sm btn-link text-decoration-none"
                            onClick={() => copyToInput(tc.input)}
                          >
                            Copy to Input
                          </button>
                        </div>

                        <div className="mb-3">
                          <div className="small text-muted mb-1">Input</div>
                          <pre className="bg-white p-3 rounded-3 mb-0 small">{tc.input || "No input"}</pre>
                        </div>

                        <div>
                          <div className="small text-muted mb-1">Expected Output</div>
                          <pre className="bg-white p-3 rounded-3 mb-0 small">{tc.expectedOutput}</pre>
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {copiedMsg && <div className="text-success small fw-medium mt-2">{copiedMsg}</div>}
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 h-100 d-flex flex-column">
              {/* Editor Top Controls */}
              <div className="card-header bg-white border-0 border-bottom p-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                <div className="d-flex flex-wrap gap-2">
                  {test.questions?.map((q, idx) => (
                    <button
                      key={q._id}
                      onClick={() => setSelectedQ(q)}
                      className={`btn btn-sm rounded-3 ${
                        selectedQ?._id === q._id ? "btn-primary" : "btn-light border"
                      }`}
                    >
                      Q{idx + 1}
                    </button>
                  ))}
                </div>

                <select
                  className="form-select form-select-sm shadow-none"
                  style={{ width: "140px" }}
                  value={language}
                  onChange={(e) => {
                    setLanguage(e.target.value);
                    setCode(templates[e.target.value] || "");
                  }}
                >
                  {supported.map((l) => (
                    <option key={l} value={l}>
                      {l.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Editor */}
              <div style={{ height: "430px" }} className="border-bottom">
                <CodeEditor
                  language={language}
                  code={code}
                  setCode={setCode}
                  theme="vs-dark"
                />
              </div>

              {/* Bottom Panel */}
              <div className="flex-grow-1">
                <div className="d-flex border-bottom bg-white">
                  <button
                    className={`btn btn-sm rounded-0 px-4 py-3 ${
                      activeTab === "console" ? "btn-light border-bottom border-3 border-primary" : "btn-white"
                    }`}
                    onClick={() => setActiveTab("console")}
                  >
                    <Terminal size={15} className="me-2" />
                    Console
                  </button>
                </div>

                <div className="row g-0" style={{ minHeight: "220px" }}>
                  <div className="col-md-6 border-end p-3 bg-white">
                    <div className="small fw-bold text-muted mb-2">Custom Input</div>
                    <textarea
                      className="form-control shadow-none"
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      placeholder="Enter custom input here..."
                      style={{
                        resize: "none",
                        minHeight: "160px",
                        fontFamily: "monospace"
                      }}
                    />
                  </div>

                  <div className="col-md-6 p-3 bg-light">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div className="small fw-bold text-muted">Execution Result</div>
                      {runResult && (
                        <div className="small text-muted d-flex align-items-center gap-2">
                          <Cpu size={13} />
                          {runResult.time ?? "-"}s • {runResult.memory ?? "-"} KB
                        </div>
                      )}
                    </div>

                    <pre
                      className={`p-3 rounded-3 small mb-0 ${
                        runResult?.status?.id === 3
                          ? "bg-white text-success"
                          : "bg-white text-dark"
                      }`}
                      style={{
                        minHeight: "160px",
                        whiteSpace: "pre-wrap"
                      }}
                    >
                      {runText || "Click Run to see output..."}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}