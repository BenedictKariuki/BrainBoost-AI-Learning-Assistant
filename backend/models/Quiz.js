import mongoose, { Schema, model } from "mongoose";

const quizSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    documentId: {
      type: Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },
    title: { type: String, required: true, trim: true },
    questions: [
      {
        question: { type: String, required: true },
        options: {
          type: [String],
          required: true,
          validate: [
            (array) => array.length === 4,
            "Must have exactly 4 options",
          ],
        },
        correctAnswer: {
          type: Number,
          required: true,
        },
        explanation: {
          type: String,
          default: "",
        },
        difficulty: {
          type: String,
          enum: ["easy", "medium", "hard"],
          default: "medium",
        },
      },
    ],
    userAnswers: [
      {
        questionIndex: {
          type: Number,
          required: true,
        },
        selectedAnswer: { type: Number, required: true },
        isCorrect: { type: Boolean, required: true },
        answeredAt: { type: Date, default: Date.now },
      },
    ],
    score: { type: Number, default: 0 },
    totalQuestions: { type: Number, required: true },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// index for faster queries
quizSchema.index({ userId: 1, documentId: 1 });

const Quiz = model("Quiz", quizSchema);

export default Quiz;
