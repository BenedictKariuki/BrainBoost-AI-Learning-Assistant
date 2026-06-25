/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import flashcardService from "../../services/flashcardService";
import PageHeader from "../../components/common/PageHeader";
import aiService from "../../services/aiService";
import Spinner from "../../components/common/Spinner";
import EmptyState from "../../components/common/EmptyState";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Flashcard from "../../components/flashcards/Flashcard";

function FlashCardPage() {
  const { id: documentId } = useParams();
  const [loading, setLoading] = useState(true);
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);

  const fetchFlashcardSets = useCallback(async () => {
    setLoading(true);
    try {
      const response =
        await flashcardService.getFlashcardsForDocument(documentId);
      setFlashcardSets(response.data[0]);
      setFlashcards(response.data[0]?.cards || []);
    } catch (error) {
      toast.error(error.error || " Could not fetch the set at this time");
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    fetchFlashcardSets();
  }, [fetchFlashcardSets]);

  const handleGenerateFlashcards = async () => {
    setGenerating(true);
    try {
      await aiService.generateFlashcards(documentId);
      toast.success("Flashcards generated successfully");
      fetchFlashcardSets();
    } catch (error) {
      toast.error("Could not generate flashcards at this time");
    } finally {
      setGenerating(false);
    }
  };

  const handleReview = async (cardIndex) => {
    const currentCard = flashcards[currentCardIndex];
    if (!currentCard) return;
    try {
      await flashcardService.reviewFlashcard(currentCard._id, cardIndex);
      toast.success("Flashcard reviewed!");
    } catch (error) {
      toast.error("Failed to review flashcard");
    }
  };

  const handleNextCard = () => {
    handleReview(currentCardIndex);
    setCurrentCardIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrevCard = () => {
    handleReview(currentCardIndex);
    setCurrentCardIndex(
      (prev) => (prev - 1 + flashcards.length) % flashcards.length,
    );
  };

  const handleToggleStar = async (cardId) => {
    try {
      await flashcardService.toggleStar(cardId);
      setFlashcards((prevFlashcards) =>
        prevFlashcards.map((card) =>
          card._id === cardId ? { ...card, isStarred: !card.isStarred } : card,
        ),
      );
      toast.success("Flashcard starred");
    } catch (error) {
      toast.error(error.error || "Failed to star flashcard");
    }
  };

  const handleDeleteFlashcardSet = async () => {
    setDeleting(true);
    try {
      await flashcardService.deleteFlashcardSet(flashcardSets._id);
      toast.success("Flashcard set deleted successfully");
      setIsDeleteModalOpen(false);
      fetchFlashcardSets();
    } catch (error) {
      toast.error("Failed to delete flashcard");
    } finally {
      setDeleting(false);
    }
  };

  const renderFlashcardContent = () => {
    if (loading) return <Spinner />;
    if (flashcards.length === 0) {
      return (
        <EmptyState
          title="No Flashcards Yet"
          description="Generate flashcards from your document to start learning."
        />
      );
    }

    const currentCard = flashcards[currentCardIndex];

    return (
      <div className="flex flex-col items-center space-y-6">
        <div className="w-full max-w-md">
          <Flashcard flashcard={currentCard} onToggleStar={handleToggleStar} />
        </div>
        <div className="flex items-center gap-4">
          <Button
            onClick={handlePrevCard}
            variant="secondary"
            disabled={flashcards.length <= 1}
          >
            <ChevronLeft size={16} />
            Previous
          </Button>
          <span className="text-sm text-neutral-600">
            {currentCardIndex + 1} / {flashcards.length}
          </span>
          <Button
            variant="secondary"
            disabled={flashcards.length <= 1}
            onClick={handleNextCard}
          >
            <ChevronRight size={16} />
            Next
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="mb-4">
        <Link
          to={`/documents/${documentId}`}
          className="group inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors duration-200"
        >
          <ArrowLeft size={16} />
          Back to Document
        </Link>
      </div>

      <PageHeader title="Flashcards">
        <div className="flex gap-2">
          {!loading && flashcards.length > 0 ? (
            <>
              <Button
                onClick={() => setIsDeleteModalOpen(true)}
                disabled={deleting}
              >
                <Trash2 size={16} />
                Delete Set
              </Button>
            </>
          ) : (
            <Button onClick={handleGenerateFlashcards} disabled={generating}>
              {generating ? (
                <Spinner />
              ) : (
                <>
                  <Plus size={16} />
                  Generate Flashcards
                </>
              )}
            </Button>
          )}
        </div>
      </PageHeader>
      {renderFlashcardContent()}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Delete Flashcards"
      >
        <div className="space-y-4 ">
          <p className="text-sm text-neutral-600">
            Are you sure you want to delete all flashcards for this document?
            This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteFlashcardSet}
              disabled={deleting}
              className="bg-red-500 hover:bg-red-500 active:bg-red-700 focus:ring-red-500"
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default FlashCardPage;
