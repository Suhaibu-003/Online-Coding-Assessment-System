import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Save, BookText, Code2, Users } from "lucide-react";
import { createTestApi, addQuestionApi, publishTestApi } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";

export default function CreateTest() {
  const navigate = useNavigate();

  // Test state
  const [testName, setTestName] = useState("");
  const [testDesc, setTestDesc] = useState("");
  const [testId, setTestId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [createdTest, setCreatedTest] = useState(false);

  // Question form state
  const [qTitle, setQTitle] = useState("");
  const [qStatement, setQStatement] = useState("");
  const [qDifficulty, setQDifficulty] = useState("medium");
  const [qLangs, setQLangs] = useState(["python"]);
  const [testCaseCount, setTestCaseCount] = useState(2);
  const [testCases, setTestCases] = useState([
    { input: "", expectedOutput: "", isHidden: false },
    { input: "", expectedOutput: "", isHidden: false }
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
      const res = await createTestApi({
        name: testName,
        description: testDesc
      });
      setTestId(res.data._id);
      setCreatedTest(true);
      setSuccess("Test created! Now add questions.");
      setError("");
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
        testCases: testCases
      });

      setQuestions([...questions, res.data]);
      setSuccess(`Question "${qTitle}" added successfully!`);

      // Reset form
      setQTitle("");
      setQStatement("");
      setQDifficulty("medium");
      setQLangs(["python"]);
      setTestCaseCount(2);
      setTestCases([
        { input: "", expectedOutput: "", isHidden: false },
        { input: "", expectedOutput: "", isHidden: false }
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
      setSuccess("Test published successfully!");
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
    <div className="min-vh-100" style={{ background: "linear-gradient(135deg, #f8f9fa, #eef2f7)" }}>
      <div className="container-fluid px-3 px-lg-4 py-4">
        <div className="row g-4">
          {/* Create Test Section */}
          <div className="col-lg-5">
            <div className="card border-0 shadow-sm rounded-4 sticky-lg-top" style={{ top: "20px" }}>
              <div className="card-body p-4">
                <div className="d-flex align-items-center gap-2 mb-4">
                  <BookText className="text-primary" size={20} />
                  <h4 className="mb-0">Create Test</h4>
                </div>

                {error && (
                  <div className="alert alert-danger small mb-3" role="alert">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="alert alert-success small mb-3" role="alert">
                    {success}
                  </div>
                )}

                {!createdTest ? (
                  <form onSubmit={handleCreateTest}>
                    <div className="mb-3">
                      <label className="form-label fw-semibold small">Test Name *</label>
                      <input
                        type="text"
                        className="form-control shadow-none"
                        value={testName}
                        onChange={(e) => setTestName(e.target.value)}
                        placeholder="e.g., JavaScript Fundamentals"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="form-label fw-semibold small">Description</label>
                      <textarea
                        className="form-control shadow-none"
                        rows="4"
                        value={testDesc}
                        onChange={(e) => setTestDesc(e.target.value)}
                        placeholder="Describe your test..."
                        style={{ resize: "none" }}
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary w-100 rounded-3"
                      disabled={loading}
                    >
                      {loading ? "Creating..." : "Create Test"}
                    </button>
                  </form>
                ) : (
                  <div>
                    <div className="alert alert-info small mb-3">
                      <strong>Test Created!</strong>
                      <p className="mb-0 mt-1">{testName}</p>
                    </div>

                    <div className="bg-light p-3 rounded-3 mb-4">
                      <div className="small text-muted mb-1">Questions Added</div>
                      <h3 className="mb-0">{questions.length}</h3>
                    </div>

                    <button
                      className="btn btn-primary w-100 rounded-3 mb-2"
                      onClick={handlePublish}
                      disabled={loading || questions.length === 0}
                    >
                      <Save size={16} className="me-2" />
                      {loading ? "Publishing..." : "Publish Test"}
                    </button>

                    <button
                      className="btn btn-outline-primary w-100 rounded-3 mb-2"
                      onClick={() => navigate(`/admin/schedule-test/${testId}`)}
                      disabled={loading}
                    >
                      <Users size={16} className="me-2" />
                      Schedule Users
                    </button>

                    <button
                      className="btn btn-outline-secondary w-100 rounded-3"
                      onClick={() => navigate("/admin")}
                    >
                      Back to Dashboard
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Add Question Section */}
          {createdTest && (
            <div className="col-lg-7">
              <div className="card border-0 shadow-sm rounded-4">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center gap-2 mb-4">
                    <Code2 className="text-primary" size={20} />
                    <h4 className="mb-0">Add Question</h4>
                  </div>

                  <form onSubmit={handleAddQuestion}>
                    {/* Question Title */}
                    <div className="mb-3">
                      <label className="form-label fw-semibold small">Question Title *</label>
                      <input
                        type="text"
                        className="form-control shadow-none"
                        value={qTitle}
                        onChange={(e) => setQTitle(e.target.value)}
                        placeholder="e.g., Sum of Two Numbers"
                      />
                    </div>

                    {/* Question Statement */}
                    <div className="mb-3">
                      <label className="form-label fw-semibold small">Problem Statement *</label>
                      <textarea
                        className="form-control shadow-none"
                        rows="5"
                        value={qStatement}
                        onChange={(e) => setQStatement(e.target.value)}
                        placeholder="Describe the problem..."
                        style={{ resize: "none" }}
                      />
                    </div>

                    {/* Difficulty & Languages */}
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold small">Difficulty</label>
                        <select
                          className="form-select shadow-none"
                          value={qDifficulty}
                          onChange={(e) => setQDifficulty(e.target.value)}
                        >
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold small">Supported Languages</label>
                        <div className="d-flex gap-2 flex-wrap">
                          {["python", "c", "cpp", "java"].map((lang) => (
                            <button
                              key={lang}
                              type="button"
                              className={`btn btn-sm rounded-3 ${
                                qLangs.includes(lang) ? "btn-primary" : "btn-outline-primary"
                              }`}
                              onClick={() => toggleLanguage(lang)}
                            >
                              {lang.toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Test Cases Count */}
                    <div className="mb-4 p-3 bg-light rounded-3">
                      <label className="form-label fw-semibold small mb-2">Number of Test Cases</label>
                      <input
                        type="number"
                        className="form-control shadow-none"
                        min="1"
                        value={testCaseCount}
                        onChange={(e) => handleTestCasesCountChange(e.target.value)}
                      />
                      <small className="text-muted">You can add/remove test cases here</small>
                    </div>

                    {/* Test Cases */}
                    <div className="mb-4">
                      <h6 className="fw-semibold mb-3">Test Cases</h6>
                      {testCases.map((tc, idx) => (
                        <div key={idx} className="card border-light mb-3">
                          <div className="card-body p-3">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <span className="fw-semibold small">Test Case {idx + 1}</span>
                              {testCases.length > 1 && (
                                <button
                                  type="button"
                                  className="btn btn-sm btn-link text-danger text-decoration-none"
                                  onClick={() => removeTestCase(idx)}
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>

                            <div className="mb-2">
                              <label className="form-label small text-muted mb-1">Input *</label>
                              <textarea
                                className="form-control form-control-sm shadow-none"
                                rows="2"
                                value={tc.input}
                                onChange={(e) => updateTestCase(idx, "input", e.target.value)}
                                placeholder="Input values"
                                style={{ resize: "none", fontFamily: "monospace", fontSize: "0.85rem" }}
                              />
                            </div>

                            <div className="mb-2">
                              <label className="form-label small text-muted mb-1">Expected Output *</label>
                              <textarea
                                className="form-control form-control-sm shadow-none"
                                rows="2"
                                value={tc.expectedOutput}
                                onChange={(e) => updateTestCase(idx, "expectedOutput", e.target.value)}
                                placeholder="Expected output"
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
                                Hidden test case (not visible to candidates)
                              </label>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary w-100 rounded-3"
                      disabled={loading}
                    >
                      <Plus size={16} className="me-2" />
                      {loading ? "Adding..." : "Add Question"}
                    </button>
                  </form>
                </div>
              </div>

              {/* Questions Added List */}
              {questions.length > 0 && (
                <div className="mt-4">
                  <h6 className="fw-semibold mb-3">Questions Added ({questions.length})</h6>
                  {questions.map((q, idx) => (
                    <div key={q._id} className="card border-light mb-2">
                      <div className="card-body p-3">
                        <div className="fw-semibold small">Q{idx + 1}: {q.title}</div>
                        <div className="small text-muted">
                          {q.testCases?.length} test cases • {q.difficulty}
                        </div>
                      </div>
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
