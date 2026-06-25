import { Router } from "express";
import protect from "../middleware/auth.js";
import {
  deleteQuiz,
  getQuizzes,
  getQuiz,
  submitQuiz,
  getQuizResults,
} from "../controllers/quizController.js";

const router = Router();

// all routes are protected
router.use(protect);

router.route("/:documentId").get(getQuizzes);
router.route("/quiz/:quizId").get(getQuiz);
router.route("/quiz/:quizId/results").get(getQuizResults);
router.route("/quiz/:quizId/submit").put(submitQuiz);
router.route("/:quizId").delete(deleteQuiz);

export default router;
