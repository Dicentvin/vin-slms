/**
 * Submission.js — A student's exam attempt
 * Stores all answers, auto-scores MCQ, flags theory for manual marking.
 */
import mongoose from "mongoose";

// ── Per-question answer ───────────────────────────────────────────────────────
const answerSchema = new mongoose.Schema(
  {
    questionId:   { type: mongoose.Schema.Types.ObjectId, required: true },
    type:         { type: String, enum: ["mcq", "theory"] },
    // MCQ
    selectedOption: { type: String, default: "" },   // "a" | "b" | "c" | "d"
    isCorrect:      { type: Boolean, default: false },
    // Theory
    answerText:   { type: String, default: "" },
    // Marks awarded (auto for MCQ, manual for theory)
    marksAwarded: { type: Number, default: 0 },
    // Teacher feedback on theory
    feedback:     { type: String, default: "" },
    markedBy:     { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    markedAt:     { type: Date, default: null },
  },
  { _id: false }
);

// ── Submission ────────────────────────────────────────────────────────────────
const submissionSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  "Exam",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  "User",
      required: true,
    },
    studentName: { type: String, default: "" },
    className:   { type: String, default: "" },

    answers: [answerSchema],

    // Scoring
    mcqScore:       { type: Number, default: 0 },   // auto
    theoryScore:    { type: Number, default: 0 },   // manual
    totalScore:     { type: Number, default: 0 },   // mcqScore + theoryScore
    maxScore:       { type: Number, default: 0 },   // copied from exam.totalMarks
    percentage:     { type: Number, default: 0 },

    // Status
    status: {
      type: String,
      enum: ["in_progress", "submitted", "marked"],
      default: "in_progress",
    },
    theoryMarkingStatus: {
      type: String,
      enum: ["pending", "partial", "complete"],
      default: "pending",
    },

    // Timing
    startedAt:    { type: Date, default: Date.now },
    submittedAt:  { type: Date, default: null },
    timeTaken:    { type: Number, default: 0 },   // seconds

    attemptNumber: { type: Number, default: 1 },
  },
  { timestamps: true }
);

// Prevent duplicate submissions (same student + exam + attempt)
submissionSchema.index({ examId: 1, studentId: 1, attemptNumber: 1 }, { unique: true });
submissionSchema.index({ studentId: 1 });
submissionSchema.index({ examId: 1, status: 1 });

export default mongoose.model("Submission", submissionSchema);
