import express  from "express";
import multer   from "multer";
import path     from "path";
import fs       from "fs";
import os       from "os";
import protect  from "../middleware/auth.js";
import {
  uploadDocument,
  getDocuments,
  getDocument,
  updateDocument,
  deleteDocument,
  approveDocument,
} from "../controllers/documentController.js";

const router = express.Router();

// ── Multer — save to OS temp dir ─────────────────────────────────────────────
const ALLOWED_MIME = new Set([
  "application/pdf",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
]);
const ALLOWED_EXT = new Set([".pdf", ".ppt", ".pptx"]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, os.tmpdir()),
  filename:    (_req, file, cb) => {
    const u = `lms-${Date.now()}-${Math.round(Math.random()*1e9)}`;
    cb(null, u + path.extname(file.originalname).toLowerCase());
  },
});

const fileFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_MIME.has(file.mimetype) || ALLOWED_EXT.has(ext)) cb(null, true);
  else cb(new Error(`Only PDF, PPT, PPTX allowed. Got: ${ext || file.mimetype}`));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 25*1024*1024 } });

const handleUpload = (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (!err) return next();
    const msg = err.code === "LIMIT_FILE_SIZE"
      ? "File too large (max 25 MB)"
      : err.message || "Upload error";
    return res.status(400).json({ success: false, message: msg });
  });
};

// ── Routes ────────────────────────────────────────────────────────────────────
router.use(protect);

router.post  ("/upload",          handleUpload, uploadDocument);
router.get   ("/",                              getDocuments);
router.get   ("/:id",                           getDocument);
router.put   ("/:id",                           updateDocument);
router.delete("/:id",                           deleteDocument);
router.patch ("/:id/approve",                   approveDocument);  // ← new

export default router;
