import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getTestByIdApi, runCodeApi, submitCodeApi } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";

const templates = {
  python: "a,b=map(int,input().split());print(a+b)",
  c: `#include <stdio.h>\nint main(){int a,b;scanf("%d %d",&a,&b);printf("%d",a+b);return 0;}\n`,
  cpp: `#include <iostream>\nusing namespace std;\nint main(){int a,b;cin>>a>>b;cout<<a+b;return 0;}\n`,
  java: `import java.util.*;\npublic class Main{\n  public static void main(String[] args){\n    Scanner sc=new Scanner(System.in);\n    int a=sc.nextInt();\n    int b=sc.nextInt();\n    System.out.print(a+b);\n  }\n}\n`
};

export default function TestPage() {
  const { id } = useParams(); // testId
  const navigate = useNavigate();

  const [test, setTest] = useState(null);
  const [selectedQ, setSelectedQ] = useState(null);
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(templates.python);
  const [customInput, setCustomInput] = useState("2 3");
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const supported = useMemo(() => selectedQ?.supportedLanguages || ["c", "cpp", "java", "python"], [selectedQ]);

  useEffect(() => {
    (async () => {
      const res = await getTestByIdApi(id);
      setTest(res.data);
      const first = res.data?.questions?.[0] || null;
      setSelectedQ(first);
    })();
  }, [id]);

  useEffect(() => {
    // Keep language valid for selected question
    if (supported && !supported.includes(language)) {
      const nextLang = supported[0] || "python";
      setLanguage(nextLang);
      setCode(templates[nextLang] || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedQ]);

  const onChangeLanguage = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    setCode(templates[lang] || "");
  };

  const handleRun = async () => {
    try {
      setRunning(true);
      setOutput("Running...\n");
      const res = await runCodeApi({
        language,
        sourceCode: code,
        customInput
      });

      const data = res.data;
      const best =
        data.stdout ||
        data.stderr ||
        data.compile_output ||
        data.message ||
        "No output";
      setOutput(best);
    } catch (e) {
      setOutput(e?.response?.data?.message || e.message);
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedQ?._id) return;

    try {
      setSubmitting(true);
      setOutput("Submitting...\n");
      const res = await submitCodeApi({
        testId: id,
        questionId: selectedQ._id,
        language,
        sourceCode: code
      });

      navigate("/result", { state: res.data });
    } catch (e) {
      setOutput(e?.response?.data?.message || e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!test) {
    return (
      <div className="container py-4">
        <div className="card p-3">
          <LoadingSpinner text="Loading test..." />
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-3">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3 px-2">
        <div>
          <h4 className="mb-0">{test.name}</h4>
          <div className="text-muted small">
            Duration: {test.durationMinutes} mins • Questions: {test.questions?.length || 0}
          </div>
        </div>
        <div className="d-flex gap-2">
          <Link to="/candidate" className="btn btn-outline-secondary">
            Back
          </Link>
          <button onClick={handleSubmit} className="btn btn-success" disabled={submitting || running}>
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>

      <div className="row g-3 px-2">
        {/* Left: Questions */}
        <div className="col-lg-3">
          <div className="card shadow-sm">
            <div className="card-header fw-semibold">Questions</div>
            <div className="list-group list-group-flush">
              {test.questions?.map((q) => (
                <button
                  key={q._id}
                  className={`list-group-item list-group-item-action ${selectedQ?._id === q._id ? "active" : ""}`}
                  onClick={() => setSelectedQ(q)}
                >
                  <div className="fw-semibold">{q.title}</div>
                  <div className="small opacity-75">{q.difficulty}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Middle: Problem + Editor */}
        <div className="col-lg-6">
          <div className="card shadow-sm mb-3">
            <div className="card-header fw-semibold">Problem</div>
            <div className="card-body">
              <h5 className="mb-2">{selectedQ?.title}</h5>
              <p className="mb-0">{selectedQ?.statement}</p>
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
              <div className="fw-semibold">Code Editor</div>
              <div className="d-flex gap-2 align-items-center">
                <select className="form-select form-select-sm" value={language} onChange={onChangeLanguage}>
                  {supported.map((l) => (
                    <option key={l} value={l}>
                      {l.toUpperCase()}
                    </option>
                  ))}
                </select>
                <button onClick={handleRun} className="btn btn-primary btn-sm" disabled={running || submitting}>
                  {running ? "Running..." : "Run"}
                </button>
              </div>
            </div>

            <div className="card-body">
              <textarea
                className="form-control"
                rows={12}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }}
              />

              <div className="row g-2 mt-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Custom Input</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Output</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={output}
                    readOnly
                  />
                </div>
              </div>

              <div className="alert alert-warning mt-3 mb-0">
                <b>Java note:</b> Use <code>public class Main</code> always.
              </div>
            </div>
          </div>
        </div>

        {/* Right: Visible Testcases */}
        <div className="col-lg-3">
          <div className="card shadow-sm">
            <div className="card-header fw-semibold">Sample Testcases</div>
            <div className="card-body">
              {(selectedQ?.testCases || [])
                .filter((tc) => tc?.isHidden === false)
                .map((tc, idx) => (
                  <div key={idx} className="mb-3">
                    <div className="fw-semibold">Case {idx + 1}</div>
                    <div className="small text-muted">Input</div>
                    <pre className="bg-light p-2 rounded">{tc.input || "(empty)"}</pre>
                    <div className="small text-muted">Expected</div>
                    <pre className="bg-light p-2 rounded mb-0">{tc.expectedOutput}</pre>
                  </div>
                ))}

              {((selectedQ?.testCases || []).filter((tc) => tc?.isHidden === false).length === 0) && (
                <div className="text-muted">No visible testcases.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
