import express from "express";
import protect from "../middleware/auth.js";
import {
  createFlashcards,
  getFlashcards,
  updateFlashcard,
  createQuiz,
  getQuizzes,
  createSummary,
  chat,
  getChatHistory,
  clearChatHistory,
  explain,
} from "../controllers/aiController.js";

const router = express.Router();
router.use(protect);

// Flashcards
router.post("/flashcards", createFlashcards);
router.get("/flashcards/:documentId", getFlashcards);
router.patch("/flashcards/:id", updateFlashcard);

// Quiz
router.post("/quiz", createQuiz);
router.get("/quiz/:documentId", getQuizzes);

// Summary
router.post("/summary", createSummary);

// Chat
router.post("/chat", chat);
router.get("/chat/:documentId", getChatHistory);
router.delete("/chat/:documentId", clearChatHistory);

// Explain concept
router.post("/explain", explain);

export default router;
