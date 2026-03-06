import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { 
  ChevronLeft, 
  Play, 
  Send, 
  Code2, 
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
  c: `#include <stdio.h>\n\nint main() {\n    int a, b;\n    if (scanf("%d %d", &a, &b) == 2) {\n        printf("%d", a + b);\n    }\n    return 0;\n}\n`,
  cpp: `#include <iostream>\n\nusing namespace std;\n\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b;\n    return 0;\n}\n`,
  java: `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int a = sc.nextInt();\n        int b = sc.nextInt();\n        System.out.print(a + b);\n    }\n}\n`
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

  useEffect(() => {
    (async () => {
      const res = await getTestByIdApi(id);
      setTest(res.data);
      setSelectedQ(res.data?.questions?.[0] || null);
    })();
  }, [id]);

  const supported = useMemo(() => selectedQ?.supportedLanguages || ["c", "cpp", "java", "python"], [selectedQ]);

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

  const visibleCases = useMemo(() => (selectedQ?.testCases || []).filter((t) => !t?.isHidden), [selectedQ]);

  const handleRun = async () => {
    try {
      setRunning(true);
      setRunText("Processing on engine...");
      const res = await runCodeApi({ language, sourceCode: code, customInput: customInput || "" });
      setRunResult(res.data);
      setRunText(res.data.stdout || res.data.stderr || res.data.compile_output || "Execution completed (no output).");
    } catch (e) {
      setRunText(e?.response?.data?.message || e.message);
    } finally { setRunning(false); }
  };

  const handleSubmit = async () => {
    if (!selectedQ?._id || !window.confirm("Are you sure you want to submit? This will end your attempt for this question.")) return;
    try {
      setSubmitting(true);
      const res = await submitCodeApi({ testId: id, questionId: selectedQ._id, language, sourceCode: code });
      navigate("/result", { state: res.data });
    } catch (e) { alert(e?.response?.data?.message || e.message); } 
    finally { setSubmitting(false); }
  };

  if (!test) return <LoadingSpinner fullScreen />;

  return (
    <div className="vh-100 d-flex flex-column bg-dark text-light overflow-hidden">
      {/* --- MODERN NAVBAR --- */}
      <nav className="navbar navbar-dark bg-black border-bottom border-secondary px-3 py-2">
        <div className="d-flex align-items-center gap-3">
          <Link to="/candidate" className="btn btn-outline-light btn-sm rounded-pill px-3">
            <ChevronLeft size={16} /> Exit
          </Link>
          <div className="vr text-secondary"></div>
          <div>
            <h6 className="mb-0 fw-bold">{test.name}</h6>
            <span className="text-secondary extra-small">{selectedQ?.title || "Loading..."}</span>
          </div>
        </div>

        <div className="d-flex gap-2">
          <div className="d-flex align-items-center bg-secondary bg-opacity-25 rounded px-3 me-2 border border-secondary">
            <span className="text-warning fw-bold small">00:{test.durationMinutes}:00</span>
          </div>
          <button className="btn btn-outline-info btn-sm px-3 d-flex align-items-center gap-2" onClick={handleRun} disabled={running}>
            <Play size={14} fill="currentColor" /> {running ? "Running..." : "Run"}
          </button>
          <button className="btn btn-success btn-sm px-4 d-flex align-items-center gap-2 fw-bold" onClick={handleSubmit} disabled={submitting}>
            <Send size={14} fill="currentColor" /> {submitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </nav>

      <div className="flex-grow-1 overflow-hidden">
        <div className="row h-100 g-0">
          
          {/* --- LEFT: PROBLEM DESCRIPTION --- */}
          <div className="col-lg-4 h-100 border-end border-secondary bg-dark overflow-auto p-4 custom-scrollbar">
            <div className="d-flex align-items-center gap-2 mb-3 text-info">
              <BookText size={18} />
              <span className="text-uppercase fw-bold small tracking-wider">Problem Statement</span>
            </div>
            
            <h3 className="fw-bold mb-3">{selectedQ?.title}</h3>
            <div className="mb-4 d-flex gap-2">
              <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1">
                {selectedQ?.difficulty || "Medium"}
              </span>
              <span className="badge bg-secondary bg-opacity-25 text-light px-2 py-1">
                Score: 100
              </span>
            </div>

            <div className="problem-statement mb-5 lh-lg opacity-90" style={{ whiteSpace: "pre-wrap" }}>
              {selectedQ?.statement}
            </div>

            <div className="d-flex align-items-center gap-2 mb-3 text-info">
              <Layers size={18} />
              <span className="text-uppercase fw-bold small tracking-wider">Test Cases</span>
            </div>

            {visibleCases.map((tc, idx) => (
              <div key={idx} className="card bg-black border-secondary mb-3">
                <div className="card-body p-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="small fw-bold text-secondary">Example {idx + 1}</span>
                    <button className="btn btn-link btn-sm text-info p-0 text-decoration-none" onClick={() => setCustomInput(tc.input)}>
                      Copy to Input
                    </button>
                  </div>
                  <div className="mb-2">
                    <div className="extra-small text-muted mb-1">INPUT</div>
                    <code className="text-light">{tc.input || "No input"}</code>
                  </div>
                  <div>
                    <div className="extra-small text-muted mb-1">EXPECTED OUTPUT</div>
                    <code className="text-success">{tc.expectedOutput}</code>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* --- RIGHT: EDITOR & CONSOLE --- */}
          <div className="col-lg-8 h-100 d-flex flex-column bg-black">
            {/* Editor Header */}
            <div className="bg-secondary bg-opacity-10 p-2 border-bottom border-secondary d-flex justify-content-between align-items-center">
              <div className="d-flex gap-2 px-2">
                {test.questions?.map((q, idx) => (
                  <button 
                    key={q._id} 
                    onClick={() => setSelectedQ(q)}
                    className={`btn btn-sm ${selectedQ?._id === q._id ? 'btn-primary' : 'btn-dark'}`}
                  >
                    Q{idx + 1}
                  </button>
                ))}
              </div>
              <select 
                className="form-select form-select-sm bg-dark text-light border-secondary shadow-none w-auto" 
                value={language} 
                onChange={(e) => {
                  setLanguage(e.target.value);
                  setCode(templates[e.target.value]);
                }}
              >
                {supported.map((l) => <option key={l} value={l}>{l.toUpperCase()}</option>)}
              </select>
            </div>

            {/* Code Editor Area */}
            <div className="flex-grow-1 overflow-hidden border-bottom border-secondary">
              <CodeEditor language={language} code={code} setCode={setCode} theme="vs-dark" />
            </div>

            {/* Console / Output Area */}
            <div className="bg-dark" style={{ height: "35%" }}>
              <div className="d-flex border-bottom border-secondary">
                <button className="btn btn-dark btn-sm rounded-0 border-end border-secondary px-3 py-2 d-flex align-items-center gap-2 border-top border-info border-3">
                  <Terminal size={14} /> Console
                </button>
              </div>
              
              <div className="row g-0 h-100">
                <div className="col-md-6 border-end border-secondary h-100 p-3 overflow-auto">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="extra-small fw-bold text-secondary uppercase">Custom Input</span>
                  </div>
                  <textarea
                    className="form-control bg-black text-info border-0 shadow-none extra-small h-75 custom-scrollbar"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="Standard input goes here..."
                    style={{ resize: "none", fontFamily: "monospace" }}
                  />
                </div>
                <div className="col-md-6 h-100 p-3 bg-black overflow-auto">
                   <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="extra-small fw-bold text-secondary uppercase">Execution Result</span>
                    {runResult && (
                      <span className="extra-small text-muted">
                        <Cpu size={10} className="me-1" /> {runResult.time}s • {runResult.memory}KB
                      </span>
                    )}
                  </div>
                  <pre className={`extra-small ${runResult?.status?.id === 3 ? "text-success" : "text-light"} custom-scrollbar`}>
                    {runText || "Click 'Run' to see output..."}
                  </pre>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}