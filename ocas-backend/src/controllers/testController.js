import Test from "../models/Test.js";
import Question from "../models/Question.js";

// Admin: create test
export const createTest = async (req, res) => {
  const { name, durationMinutes } = req.body;

  if (!name) return res.status(400).json({ message: "Test name required" });

  const test = await Test.create({
    name,
    durationMinutes: durationMinutes || 60,
    createdBy: req.user._id
  });

  res.status(201).json(test);
};

// Admin: add question to test
export const addQuestionToTest = async (req, res) => {
  const { testId } = req.params;
  const { title, statement, difficulty, supportedLanguages, testCases } = req.body;

  const test = await Test.findById(testId);
  if (!test) return res.status(404).json({ message: "Test not found" });

  const question = await Question.create({
    title,
    statement,
    difficulty,
    supportedLanguages,
    testCases
  });

  test.questions.push(question._id);
  await test.save();

  res.status(201).json({ message: "Question added", questionId: question._id });
};

// Admin: publish test
export const publishTest = async (req, res) => {
  const { testId } = req.params;

  const test = await Test.findById(testId);
  if (!test) return res.status(404).json({ message: "Test not found" });

  test.isPublished = true;
  await test.save();

  res.json({ message: "Test published" });
};

// Candidate: list published tests
export const getPublishedTests = async (req, res) => {
  const tests = await Test.find({ isPublished: true }).select("name durationMinutes createdAt");
  res.json(tests);
};

// Candidate: get test details (hide hidden expected outputs)
export const getTestById = async (req, res) => {
  const { testId } = req.params;

  const test = await Test.findById(testId).populate("questions");
  if (!test) return res.status(404).json({ message: "Test not found" });

  const safeTest = test.toObject();
  safeTest.questions = safeTest.questions.map((q) => ({
    ...q,
    testCases: q.testCases.map((tc) =>
      tc.isHidden ? { input: tc.input, isHidden: true } : tc
    )
  }));

  res.json(safeTest);
};
