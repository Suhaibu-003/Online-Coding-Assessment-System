import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Save, BookText, Code2, Users } from "lucide-react";
import { createTestApi, addQuestionApi, publishTestApi } from "../services/api";

export default function CreateTest() {
  const navigate = useNavigate();

  const [testName, setTestName] = useState("");
  const [testDesc, setTestDesc] = useState("");
  const [testId, setTestId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [createdTest, setCreatedTest] = useState(false);

  const [qTitle, setQTitle] = useState("");
  const [qStatement, setQStatement] = useState("");
  const [qDifficulty, setQDifficulty] = useState("medium");
  const [qLangs, setQLangs] = useState(["python"]);
  const [testCaseCount, setTestCaseCount] = useState(2);
  const [testCases, setTestCases] = useState([
    { input: "", expectedOutput: "", isHidden: false },
    { input: "", expectedOutput: "", isHidden: false },
  ]);

  const handleCreateTest = async (e) => {
    e.preventDefault();
    if (!testName.trim()) {
      setError("Test name is required");
      return;
    }

    try {
      setError("");
      setLoading(true);
      const res = await createTestApi({ name: testName, description: testDesc });
      setTestId(res.data._id);
      setCreatedTest(true);
      setSuccess("Test created. You can now add questions.");
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTestCasesCountChange = (count) => {
    const newCount = parseInt(count) || 0;
    setTestCaseCount(newCount);

    if (newCount < testCases.length) {
      setTestCases(testCases.slice(0, newCount));
    } else {
      const newCases = [...testCases];
      for (let i = testCases.length; i < newCount; i++) {
        newCases.push({ input: "", expectedOutput: "", isHidden: false });
      }
      setTestCases(newCases);
    }
  };

  const updateTestCase = (index, field, value) => {
    const updated = [...testCases];
    updated[index][field] = value;
    setTestCases(updated);
  };

  const removeTestCase = (index) => {
    const updated = testCases.filter((_, i) => i !== index);
    setTestCases(updated);
    setTestCaseCount(updated.length);
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!qTitle.trim() || !qStatement.trim()) {
      setError("Question title and statement are required");
      return;
    }

    if (testCases.some((tc) => !tc.input.trim() || !tc.expectedOutput.trim())) {
      setError("All test cases must have input and expected output");
      return;
    }

    try {
      setError("");
      setLoading(true);
      const res = await addQuestionApi(testId, {
        title: qTitle,
        statement: qStatement,
        difficulty: qDifficulty,
        supportedLanguages: qLangs,
        testCases,
      });

      setQuestions([...questions, res.data]);
      setSuccess(`Question "${qTitle}" added successfully.`);

      setQTitle("");
      setQStatement("");
      setQDifficulty("medium");
      setQLangs(["python"]);
      setTestCaseCount(2);
      setTestCases([
        { input: "", expectedOutput: "", isHidden: false },
        { input: "", expectedOutput: "", isHidden: false },
      ]);

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (questions.length === 0) {
      setError("Add at least one question before publishing");
      return;
    }

    try {
      setError("");
      setLoading(true);
      await publishTestApi(testId);
      setSuccess("Test published successfully.");
      setTimeout(() => navigate("/admin"), 2000);
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = (lang) => {
    if (qLangs.includes(lang)) {
      setQLangs(qLangs.filter((l) => l !== lang));
    } else {
      setQLangs([...qLangs, lang]);
    }
  };

  return (
    <div className="page-shell">
      <div className="container-fluid px-3 px-lg-4">
        <div className="row g-4">
          <div className="col-lg-5">
            <div className="surface-card p-4 sticky-lg-top" style={{ top: "20px" }}>
              <div className="d-flex align-items-center gap-2 mb-4">
                <BookText className="text-primary" size={20} />
                <h1 className="h5 mb-0 fw-bold">Create Test</h1>
              </div>

              {error && <div className="alert alert-danger py-2">{error}</div>}
              {success && <div className="alert alert-success py-2">{success}</div>}

              {!createdTest ? (
                <form onSubmit={handleCreateTest}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Test Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={testName}
                      onChange={(e) => setTestName(e.target.value)}
                      placeholder="JavaScript Fundamentals"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold">Description</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      value={testDesc}
                      onChange={(e) => setTestDesc(e.target.value)}
                      placeholder="Describe your test..."
                      style={{ resize: "none" }}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                    {loading ? "Creating..." : "Create Test"}
                  </button>
                </form>
              ) : (
                <div>
                  <div className="alert alert-info py-2 mb-3">
                    <strong>Test Created:</strong> {testName}
                  </div>

                  <div className="surface-card p-3 mb-4 bg-light border-0">
                    <div className="metric-label">Questions Added</div>
                    <div className="metric-value">{questions.length}</div>
                  </div>

                  <button className="btn btn-primary w-100 mb-2" onClick={handlePublish} disabled={loading || questions.length === 0}>
                    <Save size={15} className="me-2" />
                    {loading ? "Publishing..." : "Publish Test"}
                  </button>

                  <button
                    className="btn btn-outline-primary w-100 mb-2"
                    onClick={() => navigate(`/admin/schedule-test/${testId}`)}
                    disabled={loading}
                  >
                    <Users size={15} className="me-2" /> Schedule Users
                  </button>

                  <button className="btn btn-outline-secondary w-100" onClick={() => navigate("/admin")}>
                    Back to Dashboard
                  </button>
                </div>
              )}
            </div>
          </div>

          {createdTest && (
            <div className="col-lg-7">
              <div className="surface-card p-4">
                <div className="d-flex align-items-center gap-2 mb-4">
                  <Code2 className="text-primary" size={20} />
                  <h2 className="h5 mb-0 fw-bold">Add Question</h2>
                </div>

                <form onSubmit={handleAddQuestion}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Question Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={qTitle}
                      onChange={(e) => setQTitle(e.target.value)}
                      placeholder="Sum of Two Numbers"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Problem Statement</label>
                    <textarea
                      className="form-control"
                      rows="5"
                      value={qStatement}
                      onChange={(e) => setQStatement(e.target.value)}
                      placeholder="Describe the problem"
                      style={{ resize: "none" }}
                    />
                  </div>

                  <div className="row mb-3 g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Difficulty</label>
                      <select className="form-select" value={qDifficulty} onChange={(e) => setQDifficulty(e.target.value)}>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Supported Languages</label>
                      <div className="d-flex gap-2 flex-wrap">
                        {["python", "c", "cpp", "java"].map((lang) => (
                          <button
                            key={lang}
                            type="button"
                            className={`btn btn-sm ${qLangs.includes(lang) ? "btn-primary" : "btn-outline-primary"}`}
                            onClick={() => toggleLanguage(lang)}
                          >
                            {lang.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="surface-card border-0 bg-light p-3 mb-4">
                    <label className="form-label fw-semibold mb-2">Number of Test Cases</label>
                    <input
                      type="number"
                      className="form-control"
                      min="1"
                      value={testCaseCount}
                      onChange={(e) => handleTestCasesCountChange(e.target.value)}
                    />
                  </div>

                  <div className="mb-4">
                    <h3 className="h6 fw-semibold mb-3">Test Cases</h3>
                    {testCases.map((tc, idx) => (
                      <div key={idx} className="surface-card p-3 mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="fw-semibold small">Test Case {idx + 1}</span>
                          {testCases.length > 1 && (
                            <button type="button" className="btn btn-sm btn-link text-danger" onClick={() => removeTestCase(idx)}>
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>

                        <div className="mb-2">
                          <label className="form-label small text-muted mb-1">Input</label>
                          <textarea
                            className="form-control form-control-sm"
                            rows="2"
                            value={tc.input}
                            onChange={(e) => updateTestCase(idx, "input", e.target.value)}
                            style={{ resize: "none", fontFamily: "monospace", fontSize: "0.85rem" }}
                          />
                        </div>

                        <div className="mb-2">
                          <label className="form-label small text-muted mb-1">Expected Output</label>
                          <textarea
                            className="form-control form-control-sm"
                            rows="2"
                            value={tc.expectedOutput}
                            onChange={(e) => updateTestCase(idx, "expectedOutput", e.target.value)}
                            style={{ resize: "none", fontFamily: "monospace", fontSize: "0.85rem" }}
                          />
                        </div>

                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`hidden-${idx}`}
                            checked={tc.isHidden}
                            onChange={(e) => updateTestCase(idx, "isHidden", e.target.checked)}
                          />
                          <label className="form-check-label small" htmlFor={`hidden-${idx}`}>
                            Hidden test case
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                    <Plus size={15} className="me-2" /> {loading ? "Adding..." : "Add Question"}
                  </button>
                </form>
              </div>

              {questions.length > 0 && (
                <div className="mt-4">
                  <h3 className="h6 fw-semibold mb-3">Questions Added ({questions.length})</h3>
                  {questions.map((q, idx) => (
                    <div key={q._id} className="surface-card p-3 mb-2">
                      <div className="fw-semibold small">Q{idx + 1}: {q.title}</div>
                      <div className="section-subtitle small">{q.testCases?.length} test cases | {q.difficulty}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
