import { Router } from "express";
import {
  chat,
  explainConcept,
  generateFlashcards,
  generateQuiz,
  generateSummary,
  getChatHistory,
} from "../controllers/aiController.js";
import protect from "../middleware/auth.js";

const router = Router();

router.use(protect);
router.route("/generate-flashcards").post(generateFlashcards);
router.route("/generate-quiz").post(generateQuiz);
router.route("/generate-summary").post(generateSummary);
router.route("/chat").post(chat);
router.route("/explain-concept").post(explainConcept);
router.route("/chat-history/:documentId").post(getChatHistory);

export default router;
