import mongoose from "mongoose";

// One row per chapter. The text lives here (not on Document) so that listing
// and opening documents stays fast.
const documentChapterSchema = new mongoose.Schema({
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: "Document", required: true, index: true },
  index:      { type: Number, required: true },
  title:      { type: String, required: true },
  startPage:  { type: Number, default: 0 },
  endPage:    { type: Number, default: 0 },
  text:       { type: String, default: "" },
});

documentChapterSchema.index({ documentId: 1, index: 1 }, { unique: true });

export default mongoose.model("DocumentChapter", documentChapterSchema);
