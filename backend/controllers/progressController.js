import Document from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";

/**
 * @desc    Get user learning statistics
 * @route   GET /api/progress/dashboard
 * @access  Private
 */
export const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;
    // get counts
    const totalDocuments = await Document.countDocuments({ userId });
    const totalFlashcardSets = await Flashcard.countDocuments({ userId });
    const totalQuizzes = await Quiz.countDocuments({ userId });
    const completedQuizzes = await Quiz.countDocuments({
      userId,
      completedAt: { $exists: true, $ne: null },
    });

    // get flashcard statistics
    const flashcardSets = await Flashcard.find({ userId });
    let totalFlashcards = 0;
    let reviewedFlashcards = 0;
    let starredFlashcards = 0;
    flashcardSets.forEach((flashcardSet) => {
      totalFlashcards += flashcardSet.cards.length;
      reviewedFlashcards += flashcardSet.cards.filter(
        (card) => card.reviewCount > 0,
      ).length;
      starredFlashcards += flashcardSet.cards.filter(
        (card) => card.isStarred,
      ).length;
    });

    // get quiz statistics
    const quizzes = await Quiz.find({ userId, completedAt: { $ne: null } });
    const averageScore =
      quizzes.length > 0
        ? Math.round(
            quizzes.reduce(
              (accumulator, currentValue) => accumulator + currentValue.score,
              0,
            ) / completedQuizzes,
          )
        : 0;

    // recent activity
    const recentDocuments = await Document.find({ userId })
      .sort({ lastAccessed: -1 })
      .limit(5)
      .select("title filename lastAccessed status");

    const recentQuizzes = await Quiz.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("documentId", "title")
      .select("title score totalQuestions completedAt createdAt");

    // study streak (Simplified - in production, track daily activity)
    const studyStreak = Math.floor(Math.random() * 7) + 1; // this is mock data
    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalDocuments,
          totalFlashcardSets,
          totalFlashcards,
          reviewedFlashcards,
          starredFlashcards,
          totalQuizzes,
          completedQuizzes,
          averageScore,
          studyStreak,
        },
        recentActivity: {
          documents: recentDocuments,
          quizzes: recentQuizzes,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
