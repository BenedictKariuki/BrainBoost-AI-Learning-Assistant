// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import documentService from "../../services/documentService";
import Spinner from "../../components/common/Spinner";
import toast from "react-hot-toast";
import { ArrowLeft, ExternalLink } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import Tabs from "../../components/common/Tabs";
import ChatInterface from "../../components/chat/ChatInterface";
import AIActions from "../../components/ai/AIActions";
import FlashcardManager from "../../components/flashcards/FlashcardManager";
import QuizManager from "../../components/quizzes/QuizManager";

function DocumentDetailsPage() {
  const { id } = useParams();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Content");

  useEffect(() => {
    const fetchDocumentDetails = async () => {
      try {
        const documentDetails = await documentService.getDocumentById(id);
        setDocument(documentDetails);
      } catch (error) {
        toast.error(
          error.error || "Could not fetch the document details at this time",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentDetails(id);
  }, []);

  // helper function to get the full PDF URL on the server
  const getPDFUrl = () => {
    if (!document?.filepath) return null;
    const filePath = document.filepath;
    if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
      return filePath;
    }
    const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:8000";
    return `${baseUrl}${filePath.startsWith("/") ? "" : "/"}{filePath}`;
  };

  // THE CONTENT TAB
  const renderContent = () => {
    // for the content tab
    if (loading) {
      return <Spinner />;
    }
    if (!document || !document.filepath) {
      return <div className="text-center p-8">PDF not available</div>;
    }
    const pdfUrl = getPDFUrl();

    return (
      <div className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
        <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-300">
          <span className="text-sm font-medium text-gray-700">
            Document Viewer
          </span>
          <Link
            to={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <ExternalLink size={16} />
            Open in new tab
          </Link>
        </div>
        <div className="bg-gray-100 p-1">
          <iframe
            src={pdfUrl}
            frameBorder="0"
            className="w-full h-[70vh] bg-white rounded border border-gray-300"
            title="PDF Viewer"
            style={{ colorScheme: "light" }}
          ></iframe>
        </div>
      </div>
    );
  };

  const renderChat = () => {
    return <ChatInterface />;
  };

  const renderAIActions = () => {
    return <AIActions />;
  };

  const renderFlashcardsTab = () => {
    return <FlashcardManager documentId={id} />;
  };

  const renderQuizzesTab = () => {
    return <QuizManager documentId={id} />;
  };

  const tabs = [
    { name: "Content", label: "Content", content: renderContent() },
    { name: "Chat", label: "Chat", content: renderChat() },
    { name: "AI Actions", label: "AI Actions", content: renderAIActions() },
    { name: "Flashcards", label: "Flashcards", content: renderFlashcardsTab() },
    { name: "Quizzes", label: "Quizzes", content: renderQuizzesTab() },
  ];

  // for the whole component
  if (loading) {
    <Spinner />;
  }

  if (!document) {
    return <div className="text-center p-8">Document not found</div>;
  }
  return (
    <div>
      <div className="mb-4">
        <Link
          to="/documents"
          className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to documents
        </Link>
      </div>
      <PageHeader title={document.title}></PageHeader>
      <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default DocumentDetailsPage;
