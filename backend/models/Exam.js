/**
 * Exam.js — Official exam model
 * Supports MCQ and Theory question types.
 * Created by admin/teacher, taken by students/candidates.
 */
import mongoose from "mongoose";

// ── MCQ Option ────────────────────────────────────────────────────────────────
const mcqOptionSchema = new mongoose.Schema(
  {
    id:   { type: String, required: true },   // "a" | "b" | "c" | "d"
    text: { type: String, required: true },
  },
  { _id: false }
);

// ── Question ──────────────────────────────────────────────────────────────────
const questionSchema = new mongoose.Schema(
  {
    text:          { type: String, required: true },
    type:          { type: String, enum: ["mcq", "theory"], required: true },
    marks:         { type: Number, default: 1, min: 1 },
    // MCQ only
    options:       [mcqOptionSchema],
    correctAnswer: { type: String, default: "" },   // option id e.g. "a"
    explanation:   { type: String, default: "" },   // shown after submission
    // Theory only
    hint:          { type: String, default: "" },
    sampleAnswer:  { type: String, default: "" },   // teacher's model answer
  },
  { _id: true }
);

// ── Exam ──────────────────────────────────────────────────────────────────────
const examSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    subject:     { type: String, required: true },
    className:   {
      type: String,
      enum: ["SS1", "SS2", "SS3", "WAEC", "JAMB", "All"],
      default: "All",
    },
    type: {
      type: String,
      enum: ["mcq", "theory", "mixed"],   // mixed = both MCQ and Theory
      required: true,
    },
    duration:    { type: Number, required: true, min: 1 },  // minutes
    totalMarks:  { type: Number, default: 0 },              // auto-computed
    passMark:    { type: Number, default: 0 },              // optional pass threshold
    questions:   [questionSchema],

    // Scheduling
    status: {
      type: String,
      enum: ["draft", "active", "closed"],
      default: "draft",
    },
    scheduledAt:  { type: Date, default: null },   // null = publish immediately on activation
    closesAt:     { type: Date, default: null },   // null = manual close

    // Creator
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  "User",
      required: true,
    },
    creatorName: { type: String, default: "" },

    // Attempt control
    allowReview:   { type: Boolean, default: true  },  // show answers after submit
    shuffleQ:      { type: Boolean, default: false },  // shuffle question order
    shuffleOpts:   { type: Boolean, default: false },  // shuffle MCQ options
    attemptsAllowed: { type: Number, default: 1 },
  },
  { timestamps: true }
);

// Auto-compute totalMarks before save
examSchema.pre("save", function (next) {
  if (this.questions?.length) {
    this.totalMarks = this.questions.reduce((sum, q) => sum + (q.marks || 1), 0);
  }
  next();
});

examSchema.index({ status: 1, className: 1 });
examSchema.index({ createdBy: 1 });

export default mongoose.model("Exam", examSchema);
