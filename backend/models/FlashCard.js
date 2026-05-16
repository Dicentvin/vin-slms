import mongoose from "mongoose";

const flashCardSchema = new mongoose.Schema(
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
    question: { type: String, required: true },
    answer: { type: String, required: true },
    reviewed: { type: Boolean, default: false },
    starred: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("FlashCard", flashCardSchema);
