/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import flashcardService from "../../services/flashcardService";
import toast from "react-hot-toast";
import Spinner from "../../components/common/Spinner";
import EmptyState from "../../components/common/EmptyState";
import FlashcardSetCard from "../../components/common/FlashcardSetCard";
import PageHeader from "../../components/common/PageHeader";

function FlashcardsListPage() {
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchAllFlashcardSets = async () => {
      try {
        const response = await flashcardService.getAllFlashcardSets();
        setFlashcardSets(response.data);
        // toast.success("Flashcard sets fetched successfully");
      } catch (error) {
        toast.error("Could not fetch flashcards at this time");
      } finally {
        setLoading(false);
      }
    };
    fetchAllFlashcardSets();
  }, []);

  const renderContent = () => {
    if (loading) {
      return <Spinner />;
    }
    if (flashcardSets.length === 0) {
      return (
        <EmptyState
          title="No Flashcard Sets Found"
          description="You haven't generated any flashcards yet. Go to a document to create your first set."
        />
      );
    }
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ">
        {flashcardSets.map((set) => (
          <FlashcardSetCard key={set._id} flashcardSet={set} />
        ))}
      </div>
    );
  };

  return (
    <div className="relative min-h-screen">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] opacity-70 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto">
        <div className="relative z-10">
          <PageHeader title="All Flashcard Sets" />
        </div>
        {renderContent()}
      </div>
    </div>
  );
}

export default FlashcardsListPage;
