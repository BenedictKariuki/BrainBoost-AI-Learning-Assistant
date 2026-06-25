/* eslint-disable no-unused-vars */
import React, { useCallback, useEffect, useState } from "react";
import quizService from "../../services/quizService";
import { Plus, Trash2 } from "lucide-react";
import QuizCard from "./QuizCard";
import toast from "react-hot-toast";
import aiService from "../../services/aiService";
import Modal from "../common/Modal";
import Spinner from "../common/Spinner";
import Button from "../common/Button";
import EmptyState from "../common/EmptyState";

function QuizManager({ documentId }) {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [numQuestions, setNumQuestions] = useState(5);

  const fetchQuizzes = useCallback(async () => {
    try {
      const quizzes = await quizService.getQuizzesForDocument(documentId);
      setQuizzes(quizzes.data);
    } catch (error) {
      toast.error(error.error || "Could not fetch quizzes at this time");
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    if (documentId) {
      fetchQuizzes();
    }
  });

  const handleGenerateRequest = () => {
    setIsGenerateModalOpen(true);
  };

  const handleGenerateQuiz = async (e) => {
    e.preventDefault();
    setGenerating(true);
    try {
      await aiService.generateQuiz(documentId, { numQuestions });
      toast.success("Quiz generated successfully");
      setIsGenerateModalOpen(false);
      fetchQuizzes();
    } catch (error) {
      toast.error(error.error || "Could not generate quiz at this time");
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteRequest = (quiz) => {
    setSelectedQuiz(quiz);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedQuiz) return;
    setDeleting(true);
    try {
      await quizService.deleteQuiz(selectedQuiz._id);
      toast.success(`'${selectedQuiz.title || "Quiz"}' deleted.`);
      fetchQuizzes();
    } catch (error) {
      toast.error(error.error || "Failed to delete quiz");
    } finally {
      setDeleting(false);
      setIsDeleteModalOpen(false);
      setSelectedQuiz(null);
    }
  };

  const renderQuizContent = () => {
    if (loading) {
      return <Spinner />;
    }
    if (quizzes.length === 0) {
      return (
        <EmptyState
          title="No Quizzes Yet"
          description="Generate a quiz from your document to test your knowledge."
        />
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {quizzes.map((quiz) => (
          <QuizCard
            key={quiz._id}
            quiz={quiz}
            onDelete={handleDeleteRequest}
          ></QuizCard>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-6">
      <div className="flex justify-end gap-2 mb-4">
        <Button onClick={() => setIsGenerateModalOpen(true)}>
          <Plus size={16} />
          Generate Quiz
        </Button>{" "}
      </div>
      {renderQuizContent()}
      <Modal
        isOpen={isGenerateModalOpen}
        onClose={() => {
          setIsGenerateModalOpen(false);
        }}
        title="Generate New Quiz"
      >
        <form action="" className="space-y-4" onSubmit={handleGenerateQuiz}>
          <div>
            <label
              htmlFor=""
              className="block text-xs font-medium text-neutral-700 mb-1.5"
            >
              Number of Questions
            </label>
            <input
              type="number"
              className="w-full h-9 px-3 border border-neutral-200 rounded-lg bg-white text-sm text-neutral-900 placeholder-neutral-400 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#00d492] focus:border-transparent"
              value={numQuestions}
              onChange={(e) =>
                setNumQuestions(Math.max(1, parseInt(e.target.value)))
              }
              min="1"
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsGenerateModalOpen(false)}
              disabled={generating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={generating}>
              {generating ? "Generating..." : "Generate"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* delete confirmation modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Delete Quiz"
      >
        <div className="space-y-4">
          <p className="text-sm text-neutral-600">
            Are you sure you want to delete the quiz:{" "}
            <span className="font-semibold text-neutral-900">
              {selectedQuiz?.title || "this quiz"}
            </span>
            ? This action cannot be undone
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <button
              className="px-5 h-11 bg-linear-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-lg shadow-rose-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
              type="button"
              onClick={handleConfirmDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting" : "Delete"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default QuizManager;
