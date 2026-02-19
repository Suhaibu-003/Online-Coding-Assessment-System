import Submission from "../models/Submission.js";
import Question from "../models/Question.js";
import Test from "../models/Test.js";
import { languageMap } from "../utils/languageMap.js";
import { runOnJudge0Wait } from "../services/judge0.js";

const normalize = (s = "") => s.replace(/\r\n/g, "\n").trim();

// RUN (custom input only)
export const runCode = async (req, res) => {
  try {
    const { language, sourceCode, customInput } = req.body;

    const langId = languageMap[language];
    if (!langId) {
      return res.status(400).json({ message: "Unsupported language" });
    }

    const result = await runOnJudge0Wait({
      source_code: sourceCode,
      language_id: langId,
      stdin: customInput || ""
    });

    return res.json({
      stdout: result.stdout,
      stderr: result.stderr,
      compile_output: result.compile_output,
      status: result.status,
      time: result.time,
      memory: result.memory
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

// SUBMIT (evaluate testcases)
export const submitCode = async (req, res) => {
  try {
    const userId = req.user._id;
    const { testId, questionId, language, sourceCode } = req.body;

    const langId = languageMap[language];
    if (!langId) {
      return res.status(400).json({ message: "Unsupported language" });
    }

    const test = await Test.findById(testId);
    if (!test) return res.status(404).json({ message: "Test not found" });

    const q = await Question.findById(questionId);
    if (!q) return res.status(404).json({ message: "Question not found" });

    const sub = await Submission.create({
      candidate: userId,
      test: testId,
      question: questionId,
      language,
      sourceCode,
      status: "RUNNING",
      totalCases: q.testCases.length
    });

    let passed = 0;
    const results = [];

    for (const tc of q.testCases) {
      const result = await runOnJudge0Wait({
        source_code: sourceCode,
        language_id: langId,
        stdin: tc.input || ""
      });

      const actual = normalize(result.stdout || "");
      const expected = normalize(tc.expectedOutput || "");
      const ok = actual === expected && result?.status?.id === 3;

      if (ok) passed++;

      results.push({
        input: tc.input || "",
        expectedOutput: tc.expectedOutput,
        actualOutput: result.stdout || "",
        passed: ok,
        status: result?.status?.description,
        time: result?.time ? Number(result.time) : null,
        memory: result?.memory ? Number(result.memory) : null,
        isHidden: tc.isHidden
      });
    }

    const score = q.testCases.length
      ? Math.round((passed / q.testCases.length) * 100)
      : 0;

    sub.status = "COMPLETED";
    sub.passedCases = passed;
    sub.score = score;
    sub.results = results;
    await sub.save();

    const safeResults = results.map((r) =>
      r.isHidden ? { ...r, expectedOutput: "HIDDEN" } : r
    );

    return res.json({
      submissionId: sub._id,
      score,
      passedCases: passed,
      totalCases: q.testCases.length,
      results: safeResults
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

export const mySubmissions = async (req, res) => {
  const subs = await Submission.find({ candidate: req.user._id })
    .populate("test", "name")
    .populate("question", "title")
    .sort({ createdAt: -1 })
    .select("status score passedCases totalCases language createdAt test question");

  res.json(subs);
};

export const testSubmissions = async (req, res) => {
  const { testId } = req.params;

  const subs = await Submission.find({ test: testId })
    .populate("candidate", "name email")
    .populate("question", "title")
    .sort({ createdAt: -1 })
    .select("status score passedCases totalCases language createdAt candidate question");

  res.json(subs);
};
