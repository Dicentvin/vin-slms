import fs   from "fs";
import path from "path";
import mongoose from "mongoose";
import cloudinary   from "../config/cloudinary.js";
import Document     from "../models/Document.js";
import FlashCard    from "../models/FlashCard.js";
import Quiz         from "../models/Quiz.js";
import ChatHistory  from "../models/ChatHistory.js";
import { extractTextFromFile } from "../utils/fileParser.js";
import { splitTextIntoChunks } from "../utils/chunker.js";

// ── Upload to Cloudinary then clean up temp file ─────────────────────────────
async function uploadToCloudinary(localPath, originalName) {
  const ext          = path.extname(originalName).toLowerCase().replace(".", "");
  const resourceType = ext === "pdf" ? "image" : "raw";
  const result = await cloudinary.uploader.upload(localPath, {
    folder:        "lms-documents",
    resource_type: resourceType,
    use_filename:  false,
    tags:          ["lms", ext],
  });
  fs.unlink(localPath, () => {});
  return {
    url:          result.secure_url,
    publicId:     result.public_id,
    resourceType,
    bytes:        result.bytes,
  };
}

async function deleteFromCloudinary(publicId, resourceType = "image") {
  if (!publicId) return;
  await cloudinary.uploader
    .destroy(publicId, { resource_type: resourceType })
    .catch(e => console.warn("Cloudinary delete failed:", e.message));
}

// ── POST /api/documents/upload ────────────────────────────────────────────────
export const uploadDocument = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file received." });
  }
  const localPath = req.file.path;

  try {
    const {
      title, description,
      className = "", term = "", subject = "",
    } = req.body;

    const uploaderRole = req.user.role ?? "student";
    const isTeacherOrAdmin = uploaderRole === "teacher" || uploaderRole === "admin";

    // 1. Extract text from temp file
    let extracted;
    try {
      extracted = await extractTextFromFile(localPath);
    } catch (err) {
      fs.unlink(localPath, () => {});
      return res.status(422).json({ success: false, message: err.message });
    }

    // 2. Upload to Cloudinary
    let cloud;
    try {
      cloud = await uploadToCloudinary(localPath, req.file.originalname);
    } catch (err) {
      fs.unlink(localPath, () => {});
      return res.status(500).json({ success: false, message: "Cloudinary upload failed: " + err.message });
    }

    // 3. Chunk text for RAG
    const chunks = splitTextIntoChunks(extracted.text, 1200, 100);

    // 4. Teacher/admin uploads are auto-approved and public
    //    Student uploads start as pending and private
    const approvalStatus = isTeacherOrAdmin ? "approved" : "pending";
    const isPublic       = isTeacherOrAdmin;

    const doc = await Document.create({
      userId:       req.user._id,
      uploaderRole,
      uploaderName: req.user.name ?? "",
      title:        (title || req.file.originalname).trim(),
      description:  (description || "").trim(),
      fileName:     req.file.originalname,
      filePath:     cloud.publicId,
      cloudPublicId: cloud.publicId,
      cloudResourceType: cloud.resourceType,
      fileUrl:      cloud.url,
      fileSize:     cloud.bytes,
      fileType:     extracted.fileType,
      pages:        extracted.numPages,
      extractedText: extracted.text.slice(0, 100_000),
      chunks,
      status:       "ready",
      className:    className || "",
      term:         term || "",
      subject:      subject || "",
      approvalStatus,
      isPublic,
      approvedBy:   isTeacherOrAdmin ? req.user._id : null,
      approvedAt:   isTeacherOrAdmin ? new Date() : null,
    });

    return res.status(201).json({
      success: true,
      message: isTeacherOrAdmin
        ? "Material uploaded and published successfully."
        : "Note uploaded. Awaiting teacher approval.",
      document: {
        _id:            doc._id,
        title:          doc.title,
        description:    doc.description,
        fileType:       doc.fileType,
        pages:          doc.pages,
        fileUrl:        doc.fileUrl,
        totalChunks:    doc.chunks.length,
        className:      doc.className,
        term:           doc.term,
        subject:        doc.subject,
        uploaderRole:   doc.uploaderRole,
        uploaderName:   doc.uploaderName,
        approvalStatus: doc.approvalStatus,
        isPublic:       doc.isPublic,
        createdAt:      doc.createdAt,
      },
    });
  } catch (err) {
    if (fs.existsSync(localPath)) fs.unlink(localPath, () => {});
    console.error("uploadDocument error:", err);
    return res.status(500).json({ success: false, message: "Upload failed: " + err.message });
  }
};

// ── GET /api/documents ────────────────────────────────────────────────────────
// Query params:
//   shared=true              → public approved docs (teacher/admin materials)
//   uploaderRole=teacher     → filter by uploader role (combine with shared=true)
//   status=pending           → pending approval docs (teacher/admin only)
//   class, term, subject     → classification filters — applied to ALL modes
//   (no special param)       → own documents (userId === me)
export const getDocuments = async (req, res) => {
  try {
    const {
      shared, status,
      class: cls, term, subject,
      uploaderRole,
    } = req.query;

    const role = req.user.role;
    let filter = {};

    if (shared === "true") {
      // Public approved materials visible to everyone logged in
      filter = { isPublic: true, approvalStatus: "approved" };
      // Optionally restrict to a specific uploader role (e.g. teacher only)
      if (uploaderRole) filter.uploaderRole = uploaderRole;

    } else if (status === "pending") {
      // Pending approvals — teacher/admin only
      if (role !== "teacher" && role !== "admin") {
        return res.status(403).json({ success: false, message: "Not authorized" });
      }
      filter = { approvalStatus: "pending" };

    } else {
      // Own documents — always scoped to the requesting user
      filter = { userId: req.user._id };
    }

    // ── Classification filters — applied in ALL modes ──────────────────────
    // These narrow results further regardless of shared/pending/own mode.
    // Frontend sends "class" param (not "className") to match this.
    if (cls)          filter.className = cls;
    if (term)         filter.term      = term;
    if (subject)      filter.subject   = subject;

    const docs = await Document.find(filter)
      .select("-extractedText -chunks")
      .sort({ createdAt: -1 });

    return res.json({ success: true, count: docs.length, documents: docs });
  } catch (err) {
    console.error("getDocuments error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch documents" });
  }
};

// ── GET /api/documents/:id ────────────────────────────────────────────────────
export const getDocument = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid document ID" });
    }

    const doc = await Document.findById(req.params.id).select("-extractedText -chunks");
    if (!doc) return res.status(404).json({ success: false, message: "Document not found" });

    const isOwner      = doc.userId.toString() === req.user._id.toString();
    const isAccessible = doc.isPublic && doc.approvalStatus === "approved";
    const isStaff      = req.user.role === "teacher" || req.user.role === "admin";

    if (!isOwner && !isAccessible && !isStaff) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    return res.json({ success: true, document: doc });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to fetch document" });
  }
};

// ── PATCH /api/documents/:id/approve ─────────────────────────────────────────
export const approveDocument = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid document ID" });
    }

    if (req.user.role !== "teacher" && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const { action, rejectionReason } = req.body;
    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ success: false, message: "Action must be 'approve' or 'reject'" });
    }

    const update = action === "approve"
      ? { approvalStatus: "approved", isPublic: true,  approvedBy: req.user._id, approvedAt: new Date(), rejectionReason: "" }
      : { approvalStatus: "rejected", isPublic: false, rejectionReason: rejectionReason || "Does not meet requirements" };

    const doc = await Document.findByIdAndUpdate(req.params.id, update, { new: true })
      .select("-extractedText -chunks");

    if (!doc) return res.status(404).json({ success: false, message: "Document not found" });

    return res.json({
      success: true,
      message: action === "approve" ? "Document approved and published." : "Document rejected.",
      document: doc,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Approval failed: " + err.message });
  }
};

// ── DELETE /api/documents/:id ─────────────────────────────────────────────────
export const deleteDocument = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid document ID" });
    }

    const doc = await Document.findOne({ _id: req.params.id, userId: req.user._id });
    if (!doc) return res.status(404).json({ success: false, message: "Document not found" });

    await deleteFromCloudinary(doc.cloudPublicId || doc.filePath, doc.cloudResourceType || "image");

    await Promise.allSettled([
      FlashCard.deleteMany({ documentId: doc._id }),
      Quiz.deleteMany({ documentId: doc._id }),
      ChatHistory.deleteMany({ documentId: doc._id }),
    ]);

    await doc.deleteOne();
    return res.json({ success: true, message: "Document deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Delete failed" });
  }
};

// ── PUT /api/documents/:id ────────────────────────────────────────────────────
export const updateDocument = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid document ID" });
    }
    const { title, description } = req.body;
    const doc = await Document.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      {
        ...(title       !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description.trim() }),
      },
      { new: true, select: "-extractedText -chunks" }
    );
    if (!doc) return res.status(404).json({ success: false, message: "Document not found" });
    return res.json({ success: true, document: doc });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Update failed" });
  }
};
