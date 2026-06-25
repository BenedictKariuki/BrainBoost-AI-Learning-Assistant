import { Router } from "express";
import {
  getFlashcards,
  getAllFlashcardSets,
  reviewFlashcard,
  toggleStarFlashcard,
  deleteFlashcardSet,
} from "../controllers/flashcardController.js";

import protect from "../middleware/auth.js";

const router = Router();

router.use(protect);
// router.route("/generate").post(generateFlashcard);
router.route("/").get(getAllFlashcardSets);
router.route("/:documentId").get(getFlashcards);
router.route("/:cardId/review").post(reviewFlashcard);
router.route("/:cardId/star").put(toggleStarFlashcard);
router.route("/:Id").delete(deleteFlashcardSet);

export default router;
