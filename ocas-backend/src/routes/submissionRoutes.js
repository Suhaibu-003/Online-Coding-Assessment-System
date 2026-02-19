import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import { runCode, submitCode, mySubmissions, testSubmissions  } from "../controllers/submissionController.js";

const router = express.Router();

router.post("/run", authMiddleware, roleMiddleware("candidate"), runCode);
router.post("/submit", authMiddleware, roleMiddleware("candidate"), submitCode);
router.get("/test/:testId", authMiddleware, roleMiddleware("admin"), testSubmissions);
router.get("/my", authMiddleware, roleMiddleware("candidate"), mySubmissions);

export default router;
