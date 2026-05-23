/**
 * examRoutes.js
 * Mount at: /api/exams
 */
import express from "express";
import protect  from "../middleware/auth.js";
import {
  createExam,
  getExams,
  getExam,
  updateExam,
  deleteExam,
  setExamStatus,
  startExam,
  submitExam,
  getMyResult,
  getMyResults,
  getSubmissions,
  getSubmission,
  markSubmission,
  getAllAttempts,
} from "../controllers/examController.js";

const router = express.Router();

// All exam routes require authentication
router.use(protect);

// ── Exam CRUD ─────────────────────────────────────────────────────────────────
router.post  ("/",               createExam);    // teacher/admin
router.get   ("/",               getExams);      // all roles (filtered by role)
router.get   ("/my-results",     getMyResults);   // student — list all my results
router.get   ("/all-attempts",   getAllAttempts);  // admin/teacher — all submissions across all exams
router.get   ("/:id",            getExam);
router.put   ("/:id",            updateExam);    // teacher/admin
router.delete("/:id",            deleteExam);    // teacher/admin
router.patch ("/:id/status",     setExamStatus); // teacher/admin

// ── Candidate routes ──────────────────────────────────────────────────────────
router.post  ("/:id/start",  startExam);   // student starts attempt
router.post  ("/:id/submit", submitExam);  // student submits answers
router.get   ("/:id/result", getMyResult); // student gets own result

// ── Marking routes ────────────────────────────────────────────────────────────
router.get   ("/:id/submissions",          getSubmissions);  // admin/teacher
router.get   ("/:id/submissions/:sid",     getSubmission);   // admin/teacher
router.patch ("/:id/submissions/:sid/mark", markSubmission); // admin/teacher

export default router;
