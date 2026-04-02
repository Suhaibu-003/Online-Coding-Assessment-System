import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  Play,
  Send,
  BookText,
  Terminal,
  Cpu,
  Layers
} from "lucide-react";
import { getTestByIdApi, runCodeApi, submitCodeApi, mySubmissionsApi } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import CodeEditor from "../components/CodeEditor";

const normalize = (s = "") => s.replace(/\r\n/g, "\n").trim();

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
  const [hasAttempted, setHasAttempted] = useState(false);
  const [attemptMessage, setAttemptMessage] = useState("");
  const [submittedQuestionIds, setSubmittedQuestionIds] = useState([]);
  const [questionResultsMap, setQuestionResultsMap] = useState({});
  const [testCaseResults, setTestCaseResults] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  // eslint-disable-next-line no-unused-vars
  const [warningCount, setWarningCount] = useState(0);

  const handleSubmitWithZero = useCallback(() => {
    setSubmitting(true);
    setHasAttempted(true);
    // Navigate to results with zero score
    navigate("/result", { 
      state: { 
        score: 0, 
        message: "Test ended due to multiple violations (fullscreen exit or tab switching)." 
      } 
    });
  }, [navigate]);

  const handleSubmit = useCallback(async () => {
    if (hasAttempted) {
      alert("Retakes are not allowed. This question has already been submitted.");
      return;
    }

    if (
      !selectedQ?._id ||
      !window.confirm(
        "Are you sure you want to finish this question? Your submission will be recorded and cannot be retaken."
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
      
      setSubmittedQuestionIds((prev) => {
        const next = [...new Set([...prev, selectedQ._id.toString()])];
        return next;
      });

      setQuestionResultsMap((prev) => ({
        ...prev,
        [selectedQ._id.toString()]: res.data.results || []
      }));

      setHasAttempted(true);
      setAttemptMessage("You have already submitted this question. You cannot retake it.");

      alert("Question submitted successfully. Your score has been recorded.");

      const nextQuestion = test?.questions?.find(
        (q) => q._id.toString() !== selectedQ._id.toString() &&
        !submittedQuestionIds.includes(q._id.toString())
      );

      if (nextQuestion) {
        setSelectedQ(nextQuestion);
        setSubmitting(false);
        return;
      }

      navigate("/result", { state: res.data, replace: true });
    } catch (e) {
      setSubmitting(false);
      alert(e?.response?.data?.message || e.message);
    }
  }, [selectedQ, language, code, id, navigate, hasAttempted, submittedQuestionIds, test]);

  useEffect(() => {
    (async () => {
      const [testRes, submissionsRes] = await Promise.all([
        getTestByIdApi(id),
        mySubmissionsApi()
      ]);

      const submissions = submissionsRes.data || [];
      const submittedMap = {};
      const submittedIds = [];

      submissions.forEach((s) => {
        if (
          s.status === "COMPLETED" &&
          s.test?._id?.toString() === id.toString() &&
          s.question?._id
        ) {
          const qid = s.question._id.toString();
          submittedMap[qid] = s.results || [];
          if (!submittedIds.includes(qid)) submittedIds.push(qid);
        }
      });

      setSubmittedQuestionIds(submittedIds);
      setQuestionResultsMap(submittedMap);

      setTest(testRes.data);
      setSelectedQ(testRes.data?.questions?.[0] || null);

      const questionCount = testRes.data?.questions?.length || 0;
      const totalSeconds = questionCount * 30 * 60;
      setTimeLeft(totalSeconds);

      // Try full screen at start, optional for some browsers
      try {
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
      } catch (e) {
        console.warn("Fullscreen request blocked", e);
      }
    })();
  }, [id]);

  // Update hasAttempted when selectedQ or submission state changes
  useEffect(() => {
    if (!selectedQ) return;

    const isSubmitted = submittedQuestionIds.includes(selectedQ._id?.toString());
    setHasAttempted(isSubmitted);

    if (isSubmitted) {
      setAttemptMessage("You have already submitted this question. You cannot retake it.");
    } else {
      setAttemptMessage("");
    }

    const existingResults = questionResultsMap[selectedQ._id?.toString()];
    setTestCaseResults(existingResults || []);
  }, [selectedQ, submittedQuestionIds, questionResultsMap]);
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          alert("Time's up! Your test will be automatically submitted.");
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, handleSubmit]);

  // prevent browser back button and navigation
  useEffect(() => {
    // Block back button
    const handlePopstate = (event) => {
      event.preventDefault();
      window.history.pushState(null, "", window.location.href);
    };

    // Block history navigation
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopstate, false);

    // Prevent Link navigation away from test page
    const handleLinkClick = (e) => {
      const href = e.target.getAttribute('href');
      if (href && !href.startsWith('#') && href !== '#') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    document.addEventListener('click', handleLinkClick, true);

    return () => {
      window.removeEventListener("popstate", handlePopstate);
      document.removeEventListener('click', handleLinkClick, true);
    };
  }, []);


  // prevent refresh or tab close
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "Leaving will end your test.";
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        // Exited fullscreen
        setWarningCount(prev => {
          const newCount = prev + 1;
          if (newCount > 3) {
            handleSubmitWithZero();
          } else {
            alert(`Warning ${newCount}/3: Please stay in full screen mode.`);
          }
          return newCount;
        });
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab switched
        setWarningCount(prev => {
          const newCount = prev + 1;
          if (newCount > 3) {
            handleSubmitWithZero();
          } else {
            alert(`Warning ${newCount}/3: Tab switching is not allowed.`);
          }
          return newCount;
        });
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [handleSubmitWithZero]);
  const formattedTime = () => {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

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
  }, [selectedQ, language, supported]);

  const visibleCases = useMemo(
    () => (selectedQ?.testCases || []).filter((t) => !t?.isHidden),
    [selectedQ]
  );

  const allCases = useMemo(
    () => selectedQ?.testCases || [],
    [selectedQ]
  );

  const handleRun = async () => {
    if (hasAttempted) {
      alert("You cannot run code on this test because it is already completed.");
      return;
    }

    const inputToUse = customInput || visibleCases[0]?.input || "";
    const isCustom = !!customInput;

    try {
      setRunning(true);
      setRunText("Processing...");
      setTestCaseResults([]);
      const res = await runCodeApi({
        language,
        sourceCode: code,
        customInput: inputToUse
      });
      setRunResult(res.data);
      setRunText(
        res.data.stdout ||
        res.data.stderr ||
        res.data.compile_output ||
        "Execution completed (no output)."
      );
      // Indicate source
      if (isCustom) {
        setRunText(prev => `Custom Input Result:\n${prev}`);
      } else {
        setRunText(prev => `Test Case 1 Result:\n${prev}`);
      }
    } catch (e) {
      setRunText(e?.response?.data?.message || e.message);
    } finally {
      setRunning(false);
    }
  };

  const handleCheck = async () => {
    if (hasAttempted) {
      alert("You cannot check test cases after submission.");
      return;
    }

    if (allCases.length === 0) {
      alert("No test cases to check.");
      return;
    }

    try {
      setRunning(true);
      setRunText("Checking all test cases (including hidden)...");
      
      const results = [];
      
      for (let i = 0; i < allCases.length; i++) {
        const tc = allCases[i];
        try {
          const res = await runCodeApi({
            language,
            sourceCode: code,
            customInput: tc.input || ""
          });
          
          const passed = normalize(res.data.stdout || "") === normalize(tc.expectedOutput || "") && res.data.status?.id === 3;

          
          results.push({
            caseNumber: i + 1,
            passed,
            isHidden: tc.isHidden,
            input: tc.input,
            expected: tc.expectedOutput,
            actual: res.data.stdout || res.data.stderr || "No output",
            time: res.data.time,
            memory: res.data.memory
          });
        } catch (err) {
          results.push({
            caseNumber: i + 1,
            passed: false,
            input: tc.input,
            expected: tc.expectedOutput,
            actual: err?.response?.data?.message || err.message,
            time: "-",
            memory: "-"
          });
        }
      }
      
      setTestCaseResults(results);
      const passedCount = results.filter(r => r.passed).length;
      const totalCount = results.length;
      
      setRunText(`Test check complete: ${passedCount}/${totalCount} test cases passed`);
    } catch (e) {
      setRunText("Error checking test cases: " + e.message);
    } finally {
      setRunning(false);
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
      className="editor-shell"
      style={{ 
        background: "linear-gradient(135deg, #f8f9fa, #eef2f7)",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
        overflow: "auto",
        margin: 0,
        padding: 0
      }}
    >
      <div className="editor-topbar" style={{ flexShrink: 0 }}>
        <div className="container-fluid px-3 px-lg-4 py-2">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            {/* Left Side: Test Info */}
            <div style={{ minWidth: '300px' }}>
              <h5 className="mb-1 fw-bold">{test.name}</h5>
              <div className="text-muted small">{selectedQ?.title || "Loading question..."}</div>
            </div>

            {/* Right Side: Buttons and Timer */}
            <div className="d-flex align-items-center gap-3 flex-wrap" style={{ justifyContent: 'flex-end' }}>
              {/* Run and Submit Buttons - Together */}
              <div className="d-flex align-items-center gap-2">
                <button
                  className="btn btn-outline-primary rounded-3 d-flex align-items-center gap-2 fw-semibold"
                  onClick={handleRun}
                  disabled={running || hasAttempted}
                  title="Run code against test cases"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  <Play size={16} />
                  {running ? "Running..." : "Run"}
                </button>

                <button
                  className="btn btn-outline-info rounded-3 d-flex align-items-center gap-2 fw-semibold"
                  onClick={handleCheck}
                  disabled={running || hasAttempted}
                  title="Check all test cases"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  <Play size={16} />
                  {running ? "Checking..." : "Check"}
                </button>
              </div>

              {/* Timer Badge */}
              <div className="badge bg-light text-dark border px-3 py-2 rounded-pill" style={{ whiteSpace: 'nowrap', fontSize: '14px' }}>
                <span className="fw-bold">Time {formattedTime()}</span>
              </div>

              {/* Finish Button - Separate */}
              <button
                className="btn btn-success rounded-3 d-flex align-items-center gap-2 fw-semibold"
                onClick={handleSubmit}
                disabled={submitting || hasAttempted}
                title="Finish and submit the test"
                style={{ whiteSpace: 'nowrap' }}
              >
                <Send size={16} />
                {submitting ? "Submitting..." : "Finish"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {hasAttempted && (
        <div style={{ flexShrink: 0, backgroundColor: '#fff3cd', borderBottom: '1px solid #ffc107' }}>
          <div className="container-fluid px-3 px-lg-4 py-2">
            <div className="alert alert-warning text-center mb-0">
              {attemptMessage || "You already attempted this test. You cannot retake it."}
            </div>
          </div>
        </div>
      )}

      <div className="flex-grow-1 overflow-hidden" style={{ flexShrink: 0 }}>
        <div className="container-fluid h-100 px-3 px-lg-4 py-3" style={{ height: '100%', display: 'flex' }}>
          <div className="row g-3 w-100" style={{ display: 'flex', overflow: 'hidden' }}>

          <div className="col-lg-4" style={{ minHeight: '100%', overflow: 'auto' }}>
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

                <div className="mb-5 text-dark" style={{ whiteSpace: "pre-wrap", lineHeight: "1.8" }}>
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
                            title="Copy input to custom input section"
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

          <div className="col-lg-8" style={{ minHeight: '100%', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
            <div className="card border-0 shadow-sm rounded-4" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

              <div className="card-header bg-white border-0 border-bottom p-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                <div className="d-flex flex-wrap gap-2">
                  {test.questions?.map((q, idx) => (
                    <button
                      key={q._id}
                      onClick={() => setSelectedQ(q)}
                      className={`btn btn-sm rounded-3 ${selectedQ?._id === q._id ? "btn-primary" : "btn-light border"
                        }`}
                      title={`Question ${idx + 1}`}
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
                    const newLang = e.target.value;
                    setLanguage(newLang);
                    setCode(templates[newLang] || "");
                  }}
                  disabled={hasAttempted}
                  title="Select coding language"
                >
                  {supported.map((l) => (
                    <option key={l} value={l}>
                      {l.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ height: "350px", flexShrink: 0 }} className="border-bottom">
                <CodeEditor
                  language={language}
                  code={code}
                  setCode={setCode}
                  theme="vs-dark"
                />
              </div>

              <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
                <div className="d-flex border-bottom bg-white" style={{ flexShrink: 0 }}>
                  <button
                    className={`btn btn-sm rounded-0 px-4 py-3 ${activeTab === "console" ? "btn-light border-bottom border-3 border-primary" : "btn-white"
                      }`}
                    onClick={() => setActiveTab("console")}
                    disabled={true}
                    title="Console output"
                  >
                    <Terminal size={15} className="me-2" />
                    Console Output
                  </button>
                </div>

                <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
                  <div className="row g-0 p-3" style={{ flex: testCaseResults.length > 0 ? '0 0 auto' : '1' }}>
                    <div className="col-md-6 border-end" style={{ minHeight: "160px", display: 'flex', flexDirection: 'column' }}>
                      <div className="small fw-bold text-muted mb-2">Custom Input</div>
                      <textarea
                        className="form-control shadow-none"
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        placeholder="Enter custom input here..."
                        disabled={hasAttempted}
                        style={{
                          resize: "none",
                          flex: 1,
                          fontFamily: "monospace",
                          overflow: 'auto'
                        }}
                      />
                    </div>

                    <div className="col-md-6 p-3 bg-light" style={{ minHeight: "160px", display: 'flex', flexDirection: 'column' }}>
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
                        className={`p-3 rounded-3 small mb-0 ${runResult?.status?.id === 3
                          ? "bg-white text-success"
                          : "bg-white text-dark"
                          }`}
                        style={{
                          maxHeight: "200px",
                          whiteSpace: "pre-wrap",
                          overflow: 'auto',
                          flex: 1
                        }}
                      >
                        {runText || "Click Run to see output..."}
                      </pre>
                    </div>
                  </div>

                  {/* Test Case Results */}
                  {testCaseResults.length > 0 && (
                    <div style={{ flex: 1, overflow: 'auto', borderTop: '2px solid #dee2e6' }}>
                      <div className="p-3">
                        <h6 className="fw-bold mb-2">Test Case Results</h6>
                        <div className="d-flex flex-column gap-2">
                          {testCaseResults.map((result, idx) => (
                            <div
                              key={idx}
                              className="card small"
                              style={{
                                borderLeft: `4px solid ${result.passed ? '#28a745' : '#dc3545'}`,
                                padding: '8px 12px'
                              }}
                            >
                              <div className="d-flex justify-content-between align-items-center">
                                <span className="fw-semibold">Test Case {result.caseNumber} {result.isHidden ? '(hidden)' : ''}</span>
                                <span className={`badge ${result.passed ? 'bg-success' : 'bg-danger'}`}>
                                  {result.passed ? 'Passed' : 'Failed'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
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
