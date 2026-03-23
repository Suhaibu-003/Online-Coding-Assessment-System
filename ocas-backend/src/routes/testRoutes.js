import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import {
  createTest,
  addQuestionToTest,
  publishTest,
  getPublishedTests,
  getTestById,
  getCandidateUsers,
  assignTestToUsers,
  getTestWithAssignments
} from "../controllers/testController.js";

const router = express.Router();

// Candidate (must be logged in)
router.get("/", authMiddleware, getPublishedTests);
router.get("/:testId", authMiddleware, getTestById);

// Admin
router.post("/", authMiddleware, roleMiddleware("admin"), createTest);
router.post("/:testId/questions", authMiddleware, roleMiddleware("admin"), addQuestionToTest);
router.patch("/:testId/publish", authMiddleware, roleMiddleware("admin"), publishTest);
router.get("/admin/users/candidates", authMiddleware, roleMiddleware("admin"), getCandidateUsers);
router.get("/admin/:testId/assignments", authMiddleware, roleMiddleware("admin"), getTestWithAssignments);
router.patch("/:testId/assign-users", authMiddleware, roleMiddleware("admin"), assignTestToUsers);

export default router;
