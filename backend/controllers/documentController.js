import Document from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";
import { extractTextFromPDF } from "../utils/pdfParser.js";
import { chunkText } from "../utils/textChunker.js";
import fs from "fs/promises";
import mongoose from "mongoose";

/**
 * @desc Upload PDF Document
 * @route POST /api/documents/upload
 * @access Private
 */
export const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "Please upload a PDF file",
        statusCode: 400,
      });
    }
    const { title } = req.body;
    if (!title) {
      // Delete the uploaded file if no title
      await fs.unlink(req.file.path);
      return res.status(400).json({
        success: false,
        error: "Please provide a title for the document",
        statusCode: 400,
      });
    }
    // construct a URL for the uploaded file
    const baseUrl = `http://localhost:${process.env.PORT || 8000}`;
    const fileUrl = `${baseUrl}/uploads/documents/${req.file.filename}`;

    // create a document record in to the db
    const document = await Document.create({
      userId: req.user._id,
      title,
      filename: req.file.originalname,
      filepath: fileUrl,
      filesize: req.file.size,
      status: "processing",
    });
    // process the file in the background. In production, use a message queue library like Bull
    processPDF(document._id, req.file.path).catch((err) => {
      console.log("PDF processing error:", error);
    });
    res.status(201).json({
      success: true,
      data: document,
      message: "Document uploaded successfully. Processing in progress...",
    });
  } catch (error) {
    // if error uploading, clean up the file from the server's file system
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    next(error);
  }
};

// helper function to process PDF
async function processPDF(documentId, filepath) {
  try {
    const { text } = await extractTextFromPDF(filepath);
    // create chunks
    const chunks = chunkText(text, 500, 50);
    // update document to include these
    await Document.findByIdAndUpdate(documentId, {
      extractedText: text,
      chunks,
      status: "ready",
    });
  } catch (error) {
    console.log(`Error processing document ${documentId}`, error);
    await Document.findOneAndUpdate(documentId, { status: "failed" });
  }
}

// @desc Get all user documents
// @route GET /api/documents
// @access Private
export const getDocuments = async (req, res, next) => {
  try {
    const documents = await Document.aggregate([
      {
        $match: { userId: req.user._id },
      },
      {
        $lookup: {
          from: "flashcards",
          localField: "_id",
          foreignField: "documentId",
          as: "flashcardSets",
        },
      },
      {
        $lookup: {
          from: "quizzes",
          localField: "_id",
          foreignField: "documentId",
          as: "quizzes",
        },
      },
      {
        $addFields: {
          flashcardCount: { $size: "$flashcardSets" },
          quizCount: { $size: "$quizzes" },
        },
      },
      {
        $project: {
          extractedText: 0,
          chunks: 0,
          flashcardSets: 0,
          quizzes: 0,
        },
      },
      { $sort: { uploadDate: -1 } },
    ]);
    res
      .status(200)
      .json({ success: true, count: documents.length, data: documents });
  } catch (error) {}
};

// @desc Get single document with chunks
// @route GET /api/documents/:id
// @access Private
export const getDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!document) {
      return res
        .status(404)
        .json({ success: false, error: "Document not found", statusCode: 404 });
    }
    // get counts of associated flashcards and quizzes
    const flashcardsCount = await Flashcard.countDocuments({
      documentId: document._id,
      userId: req.user._id,
    });
    const quizCount = await Quiz.countDocuments({
      documentId: document._id,
      userId: req.user._id,
    });
    // update last accessed
    document.lastAccessed = Date.now();
    await document.save();
    // combine document data with counts
    const docData = document.toObject();
    docData.flashcardCount = flashcardsCount;
    docData.quizCount = quizCount;
    res.status(200).json({ success: true, data: docData });
  } catch (error) {
    next(error);
  }
};

// @desc Delete a document
// @route DELETE /api/documents/:id
// @access Private
export const deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
        statusCode: 404,
      });
    }
    // delete file from the file system
    await fs.unlink(document.filepath).catch(() => {});
    // delete the document from the database
    await document.deleteOne();
    res.status(200).json({
      success: true,
      message: `Document ${document.title} has been deleted successfully`,
    });
  } catch (error) {
    next(error);
  }
};
