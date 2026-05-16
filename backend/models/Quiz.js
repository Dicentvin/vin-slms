import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    questionText: { type: String, required: true },
    options: [String],
    correctAnswer: { type: String, required: true },
    explanation: { type: String, default: "" },
  },
  { _id: false }
);

const quizSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },
    title: { type: String, required: true },
    questions: [questionSchema],
    totalQuestions: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Quiz", quizSchema);
