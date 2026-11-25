import mongoose from "mongoose";
import Document from "../models/Document.js";
import DocumentChapter from "../models/DocumentChapter.js";
import FlashCard from "../models/FlashCard.js";
import Quiz from "../models/Quiz.js";
import ChatHistory from "../models/ChatHistory.js";
import {
  generateFlashcards,
  generateQuiz,
  summarizeText,
  chatWithDocument,
  explainConcept,
} from "../utils/gemini.js";
import { sampleChapters, MAX_INPUT_CHARS, MAX_QUIZ_CHAPTERS } from "../utils/chapters.js";
import { getRelevantContext } from "../utils/retrieval.js";

function validId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

async function getDoc(docId) {
  return Document.findOne({ _id: docId }).lean();
}

function getTextFromDoc(doc) {
  if (doc.chunks?.length) return doc.chunks.map((c) => c.content).join("\n\n");
  return doc.extractedText || "";
}

// ── POST /api/ai/flashcards ──────────────────────────────────────────────────
export const createFlashcards = async (req, res) => {
  try {
    const { documentId, count = 20 } = req.body;
    if (!validId(documentId))
      return res.status(400).json({ success: false, message: "Invalid document ID" });

    const doc = await getDoc(documentId);
    if (!doc)
      return res.status(404).json({ success: false, message: "Document not found" });

    const text = getTextFromDoc(doc);
    if (text.trim().length < 50)
      return res.status(400).json({ success: false, message: "Document has too little text" });

    const cards = await generateFlashcards(text, parseInt(count));
    if (!cards.length)
      return res.status(500).json({ success: false, message: "AI returned no flashcards" });

    await FlashCard.deleteMany({ documentId: doc._id, userId: req.user._id });

    const inserted = await FlashCard.insertMany(
      cards.map((c) => ({
        userId:     req.user._id,
        documentId: doc._id,
        question:   c.question,
        answer:     c.answer,
      }))
    );

    return res.status(201).json({
      success:    true,
      message:    `${inserted.length} flashcards generated`,
      count:      inserted.length,
      flashcards: inserted,
    });
  } catch (err) {
    console.error("createFlashcards error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/ai/flashcards/:documentId ──────────────────────────────────────
export const getFlashcards = async (req, res) => {
  try {
    const { documentId } = req.params;
    if (!validId(documentId))
      return res.status(400).json({ success: false, message: "Invalid document ID" });

    const cards = await FlashCard.find({
      documentId,
      userId: req.user._id,
    }).sort({ createdAt: 1 });

    return res.json({ success: true, count: cards.length, flashcards: cards });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── PATCH /api/ai/flashcards/:id ────────────────────────────────────────────
export const updateFlashcard = async (req, res) => {
  try {
    const card = await FlashCard.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: req.body },
      { new: true }
    );
    if (!card)
      return res.status(404).json({ success: false, message: "Flashcard not found" });
    return res.json({ success: true, flashcard: card });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/ai/quiz ────────────────────────────────────────────────────────
// Body: { documentId, count?, chapters?: number[] }
//   chapters = chapter indexes to quiz on. Leave out to quiz on the whole document.
export const createQuiz = async (req, res) => {
  try {
    const { documentId, count = 10, chapters } = req.body;
    if (!validId(documentId))
      return res.status(400).json({ success: false, message: "Invalid document ID" });

    const doc = await getDoc(documentId);
    if (!doc)
      return res.status(404).json({ success: false, message: "Document not found" });

    const wanted = Array.isArray(chapters)
      ? [...new Set(chapters.map(Number).filter((n) => Number.isInteger(n) && n >= 0))]
      : [];

    let text;
    let chapterNames = [];

    if (wanted.length) {
      if (wanted.length > MAX_QUIZ_CHAPTERS) {
        return res.status(400).json({
          success: false,
          message: `Please pick at most ${MAX_QUIZ_CHAPTERS} chapters for one quiz.`,
        });
      }
      const rows = await DocumentChapter.find({ documentId: doc._id, index: { $in: wanted } })
        .sort({ index: 1 })
        .lean();
      if (!rows.length) {
        return res.status(404).json({
          success: false,
          message: "Those chapters were not found. Re-upload the document to enable chapter quizzes.",
        });
      }
      chapterNames = rows.map((r) => r.title);
      text = sampleChapters(rows, MAX_INPUT_CHARS);
    } else {
      text = getTextFromDoc(doc);
    }

    if (text.trim().length < 50)
      return res.status(400).json({ success: false, message: "Not enough text to make a quiz from" });

    const questions = await generateQuiz(text, parseInt(count), { chapterNames });
    if (!questions.length)
      return res.status(500).json({ success: false, message: "AI returned no questions. Please try again." });

    const quiz = await Quiz.create({
      userId:         req.user._id,
      documentId:     doc._id,
      title:          chapterNames.length ? `Quiz: ${chapterNames.join(", ").slice(0, 150)}` : `Quiz: ${doc.title}`,
      questions,
      totalQuestions: questions.length,
      chapters:       wanted.length ? wanted : [],
      chapterLabels:  chapterNames,
    });

    return res.status(201).json({ success: true, quiz });
  } catch (err) {
    console.error("createQuiz error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/ai/quiz/:documentId ─────────────────────────────────────────────
export const getQuizzes = async (req, res) => {
  try {
    const { documentId } = req.params;
    if (!validId(documentId))
      return res.status(400).json({ success: false, message: "Invalid document ID" });

    const quizzes = await Quiz.find({
      documentId,
      userId: req.user._id,
    }).sort({ createdAt: -1 });

    return res.json({ success: true, count: quizzes.length, quizzes });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/ai/summary ─────────────────────────────────────────────────────
export const createSummary = async (req, res) => {
  try {
    const { documentId } = req.body;
    if (!validId(documentId))
      return res.status(400).json({ success: false, message: "Invalid document ID" });

    const doc = await getDoc(documentId);
    if (!doc)
      return res.status(404).json({ success: false, message: "Document not found" });

    const text = getTextFromDoc(doc);
    if (!text.trim())
      return res.status(400).json({ success: false, message: "Document has no text" });

    const summary = await summarizeText(text);
    return res.json({ success: true, documentId, summary });
  } catch (err) {
    console.error("createSummary error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/ai/chat ─────────────────────────────────────────────────────────
export const chat = async (req, res) => {
  try {
    const { documentId, query } = req.body;

    if (!query?.trim())
      return res.status(400).json({ success: false, message: "Query is required" });

    // ── Special case: dashboard AI insight (no document needed) ──────────────
    if (documentId === "dashboard") {
      const result = await chatWithDocument([], query);
      return res.json({ success: true, answer: result.answer, usedChunks: 0 });
    }

    if (!validId(documentId))
      return res.status(400).json({ success: false, message: "Invalid document ID" });

    const doc = await getDoc(documentId);
    if (!doc)
      return res.status(404).json({ success: false, message: "Document not found" });

    // Search the whole book for the passages that answer this question
    const ctx = await getRelevantContext(doc, query);
    const result = await chatWithDocument(ctx.passages, query, { outline: ctx.outline });

    // Save to chat history
    await ChatHistory.findOneAndUpdate(
      { userId: req.user._id, documentId: doc._id },
      {
        $push: {
          messages: [
            { role: "user",      content: query },
            { role: "assistant", content: result.answer },
          ],
        },
      },
      { upsert: true, new: true }
    );

    return res.json({
      success:    true,
      answer:     result.answer,
      usedChunks: result.usedChunks,
    });
  } catch (err) {
    console.error("chat error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/ai/chat/:documentId ─────────────────────────────────────────────
export const getChatHistory = async (req, res) => {
  try {
    const { documentId } = req.params;
    if (!validId(documentId))
      return res.status(400).json({ success: false, message: "Invalid document ID" });

    const history = await ChatHistory.findOne({
      userId: req.user._id,
      documentId,
    });

    return res.json({ success: true, messages: history?.messages || [] });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── DELETE /api/ai/chat/:documentId ─────────────────────────────────────────
export const clearChatHistory = async (req, res) => {
  try {
    const { documentId } = req.params;
    if (!validId(documentId))
      return res.status(400).json({ success: false, message: "Invalid document ID" });

    await ChatHistory.findOneAndUpdate(
      { userId: req.user._id, documentId },
      { $set: { messages: [] } }
    );
    return res.json({ success: true, message: "Chat history cleared" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/ai/explain ─────────────────────────────────────────────────────
export const explain = async (req, res) => {
  try {
    const { documentId, concept } = req.body;

    if (!concept?.trim())
      return res.status(400).json({ success: false, message: "Concept is required" });
    if (!validId(documentId))
      return res.status(400).json({ success: false, message: "Invalid document ID" });

    const doc = await getDoc(documentId);
    if (!doc)
      return res.status(404).json({ success: false, message: "Document not found" });

    const ctx = await getRelevantContext(doc, concept);
    const explanation = await explainConcept(concept, ctx.passages, { outline: ctx.outline });
    return res.json({ success: true, concept, explanation });
  } catch (err) {
    console.error("explain error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
