import Quiz from "../models/Quiz.js";

/**
 * @desc Get all quizzes for a document
 * @route GET /api/quiz/:documentId
 * @access Private
 */
export const getQuizzes = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: "Please provide a document id",
        statusCode: 400,
      });
    }
    const quizzes = await Quiz.find({
      documentId,
      userId: req.user._id,
    })
      .populate("documentId", "title filename")
      .sort({ createdAt: -1 });
    if (!quizzes) {
      return res.status(404).json({
        success: false,

        error: "No quizzes for this document",
        statusCode: 404,
      });
    }
    res.status(200).json({
      success: true,
      count: quizzes.length,
      data: quizzes,
      message: "Quizzes retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get a single quiz by Id
 * @route GET /api/quiz/:quizId
 * @access Private
 */
export const getQuiz = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    if (!quizId) {
      return res.status(400).json({
        success: false,
        error: "Please provide a quiz id",
        statusCode: 400,
      });
    }
    const quiz = await Quiz.findOne({
      _id: quizId,
      userId: req.user._id,
    }).populate("documentId", "title filename");
    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: "Quiz not found",
        statusCode: 404,
      });
    }
    return res.status(200).json({
      success: true,
      data: quiz,
      message: "Quiz retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get quiz results
 * @route GET /api/quiz/:quizId/results
 * @access Private
 */
export const getQuizResults = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    if (!quizId) {
      return res.status(400).json({
        success: false,
        error: "Please provide a quiz id",
        statusCode: 400,
      });
    }
    const quiz = await Quiz.findOne({
      _id: quizId,
      userId: req.user._id,
    }).populate("documentId", "title filename");
    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: "Quiz not found",
        statusCode: 404,
      });
    }
    if (!quiz.completedAt) {
      return res.status(400).json({
        success: false,
        error: "This quiz has not been completed",
        statusCode: 404,
      });
    }
    const results = quiz.questions.map((question, index) => {
      const userAnswer = quiz.userAnswers.find(
        (ans) => ans.questionIndex === index,
      );
      return {
        questionIndex: index,
        question: question.question,
        options: question.options,
        selectedAnswer: userAnswer?.selectedAnswer ?? null,
        correctAnswer: question.correctAnswer,
        isCorrect: userAnswer?.isCorrect || false,
        explanation: question.explanation,
      };
    });
    res.status(200).json({
      success: true,
      data: {
        quiz: {
          id: quiz._id,
          title: quiz.title,
          document: quiz.documentId,
          score: quiz.score,
          totalQuestions: quiz.totalQuestions,
          completedAt: quiz.completedAt,
        },
        results,
      },
      statusCode: 200,
    });
  } catch (error) {
    next(error);
  }
};
/**
 * @desc Submit quiz answers
 * @route PUT /api/quiz/:quizId/submit
 * @access Private
 */
export const submitQuiz = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const { userAnswers } = req.body;
    if (!quizId) {
      return res.status(400).json({
        success: false,
        error: "Please provide a quiz id",
        statusCode: 400,
      });
    }
    if (!Array.isArray(userAnswers)) {
      return res.status(400).json({
        success: false,
        error: "Please provide the answers as an array",
        statusCode: 400,
      });
    }
    const quiz = await Quiz.findOne({ _id: quizId, userId: req.user._id });
    if (!quiz) {
      return res
        .status(404)
        .json({ success: false, error: "Quiz not found", statusCode: 404 });
    }

    if (quiz.completedAt) {
      return res.status(400).json({
        success: false,
        error: "Quiz already completed",
        statusCode: 404,
      });
    }
    // loop through the answers and compare the correct answer to the provided answer
    let answers = [],
      score = 0;

    userAnswers.forEach((ans) => {
      const { questionIndex, selectedAnswer } = ans;

      if (questionIndex >= 0 && questionIndex < quiz.totalQuestions) {
        const currentQuestion = quiz.questions[questionIndex];
        if (!currentQuestion) return;
        const correctAnswer = currentQuestion.correctAnswer;
        const isCorrect = selectedAnswer === correctAnswer;

        if (isCorrect) score++;

        answers.push({
          questionIndex: questionIndex,
          selectedAnswer: selectedAnswer,
          isCorrect,
          answeredAt: new Date(),
        });
      }
    });
    quiz.userAnswers = answers;
    quiz.score = Math.round((score / quiz.totalQuestions) * 100);
    quiz.completedAt = new Date();
    await quiz.save();

    res.status(200).json({
      success: true,
      data: {
        quizId: quiz.id,
        score: quiz.score,
        correctCount: score,
        totalQuestions: quiz.totalQuestions,
        userAnswers: answers,
      },
      message: "Quiz completed successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Delete a quiz
 * @route DELETE /api/quiz/:quizId
 * @access Private
 */
export const deleteQuiz = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    if (!quizId) {
      return res.status(400).json({
        success: false,
        error: "Please provide a quiz id",
        statusCode: 400,
      });
    }
    const quiz = await Quiz.findOne({
      _id: quizId,
      userId: req.user._id,
    });
    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: "Quiz not found",
        statusCode: 404,
      });
    }
    await quiz.deleteOne();
    res.status(200).json({
      success: true,
      message: "Quiz deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
