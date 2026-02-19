import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import {
  createTest,
  addQuestionToTest,
  publishTest,
  getPublishedTests,
  getTestById
} from "../controllers/testController.js";

const router = express.Router();

// Candidate (must be logged in)
router.get("/", authMiddleware, getPublishedTests);
router.get("/:testId", authMiddleware, getTestById);

// Admin
router.post("/", authMiddleware, roleMiddleware("admin"), createTest);
router.post("/:testId/questions", authMiddleware, roleMiddleware("admin"), addQuestionToTest);
router.patch("/:testId/publish", authMiddleware, roleMiddleware("admin"), publishTest);

export default router;
