import mongoose from "mongoose";

const chunkSchema = new mongoose.Schema(
  {
    content:    { type: String, required: true },
    pageNumber: { type: Number, default: 0 },
    index:      { type: Number, required: true },
  },
  { _id: false }
);

const documentSchema = new mongoose.Schema(
  {
    userId:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    uploaderRole: { type: String, default: "student" },
    uploaderName: { type: String, default: "" },

    title:       { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    fileName:    { type: String, required: true },

    // Cloudinary
    filePath:          { type: String, required: true },
    cloudPublicId:     { type: String, default: "" },
    cloudResourceType: { type: String, default: "image" },
    fileUrl:           { type: String, default: "" },
    fileSize:          { type: Number, required: true },

    // ← Added doc and docx to the enum
    fileType: {
      type: String,
      enum: ["pdf", "ppt", "pptx", "doc", "docx"],
      default: "pdf",
    },
    pages: { type: Number, default: 0 },

    // Classification
    className: { type: String, default: "" },
    term:      { type: String, default: "" },
    subject:   { type: String, default: "" },

    // Approval workflow
    approvalStatus:  { type: String, enum: ["pending","approved","rejected"], default: "pending" },
    isPublic:        { type: Boolean, default: false },
    approvedBy:      { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    approvedAt:      { type: Date, default: null },
    rejectionReason: { type: String, default: "" },

    extractedText: { type: String, default: "" },
    chunks:        [chunkSchema],
    status: {
      type: String,
      enum: ["processing", "ready", "failed"],
      default: "processing",
    },
  },
  { timestamps: true }
);

documentSchema.index({ isPublic: 1, approvalStatus: 1 });
documentSchema.index({ className: 1, term: 1, subject: 1 });
documentSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("Document", documentSchema);
