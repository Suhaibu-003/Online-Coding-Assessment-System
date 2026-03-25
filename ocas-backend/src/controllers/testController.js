import mongoose from "mongoose";
import Test from "../models/Test.js";
import Question from "../models/Question.js";
import User from "../models/User.js";

// Admin: create test
export const createTest = async (req, res) => {
  const { name, description, durationMinutes, isPublicTest } = req.body;

  if (!name) return res.status(400).json({ message: "Test name required" });

  const test = await Test.create({
    name,
    description: description || "",
    durationMinutes: durationMinutes || 60,
    isPublicTest: isPublicTest !== undefined ? isPublicTest : true,
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

  const test = await Test.findById(testId).populate("questions");
  if (!test) return res.status(404).json({ message: "Test not found" });

  test.durationMinutes = test.questions.length * 30;
  test.isPublished = true;
  await test.save();

  res.json({ message: "Test published" });
};

// Admin: Get all candidate users for assignment
export const getCandidateUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "candidate" })
      .select("_id name email")
      .sort({ name: 1 });
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Assign test to specific users
export const assignTestToUsers = async (req, res) => {
  try {
    const { testId } = req.params;
    const { userIds, isPublicTest } = req.body;

    const test = await Test.findById(testId);
    if (!test) return res.status(404).json({ message: "Test not found" });

    if (!test.questions || test.questions.length === 0) {
      return res.status(400).json({ message: "Add at least one question before assigning test" });
    }

    // Replace assigned users with new list (if invalid IDs exist, ignore them)
    test.assignedUsers = Array.isArray(userIds)
      ? userIds.filter(Boolean)
      : [];

    // Update the public/private status
    if (typeof isPublicTest === "boolean") {
      test.isPublicTest = isPublicTest;
    }

    // Automatically publish the test when assigning to users
    test.isPublished = true;

    await test.save();

    // Populate and return full test data
    await test.populate([
      { path: "assignedUsers", select: "_id name email" },
      { path: "questions" }
    ]);

    res.json({ 
      message: "Test assigned and published successfully", 
      test 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Get test details with assignment info
export const getTestWithAssignments = async (req, res) => {
  try {
    const { testId } = req.params;

    const test = await Test.findById(testId)
      .populate("assignedUsers", "_id name email")
      .populate("questions");
    
    if (!test) return res.status(404).json({ message: "Test not found" });

    res.json(test);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Candidate: list published tests (only those public OR assigned to them)
export const getPublishedTests = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const tests = await Test.find({
      $or: [
        { isPublished: true, isPublicTest: true },
        { assignedUsers: { $in: [userId] } }
      ]
    })
      .select("_id name description durationMinutes createdAt isPublicTest questions")
      .populate("questions", "_id");

    const result = tests.map((t) => ({
      _id: t._id,
      name: t.name,
      description: t.description,
      durationMinutes: t.durationMinutes,
      createdAt: t.createdAt,
      isPublicTest: t.isPublicTest,
      questionCount: (t.questions || []).length
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Candidate: get test details (hide hidden expected outputs)
export const getTestById = async (req, res) => {
  const { testId } = req.params;
  const userId = req.user._id;

  const test = await Test.findById(testId).populate("questions");
  if (!test) return res.status(404).json({ message: "Test not found" });

  // Check if candidate is allowed to access this test
  // If it's a private test, user must be in assignedUsers array
  if (!test.isPublicTest) {
    const assignedUsers = Array.isArray(test.assignedUsers) ? test.assignedUsers : [];
    const isAssigned = assignedUsers.some(
      (id) => id.toString() === userId.toString()
    );

    if (!isAssigned) {
      return res.status(403).json({ message: "You don't have access to this test" });
    }
  }

  const safeTest = test.toObject();
  safeTest.questions = safeTest.questions.map((q) => ({
    ...q,
    testCases: q.testCases.map((tc) =>
      tc.isHidden ? { input: tc.input, isHidden: true } : tc
    )
  }));

  res.json(safeTest);
};
