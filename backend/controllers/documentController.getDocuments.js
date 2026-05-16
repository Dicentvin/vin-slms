// ── GET /api/documents ────────────────────────────────────────────────────────
// Query params:
//   shared=true              → all public approved docs
//   uploaderRole=teacher     → filter by uploader role (used with shared=true)
//   status=pending           → pending docs (teacher/admin only)
//   class, term, subject     → classification filters
//
// NOTE: this is a PATCH file — replace only the getDocuments export in
// your existing documentController.js with this function.
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
      // Public approved materials — any logged-in user can see
      filter = { isPublic: true, approvalStatus: "approved" };
      // Optionally filter by who uploaded (e.g. uploaderRole=teacher)
      if (uploaderRole) filter.uploaderRole = uploaderRole;
    } else if (status === "pending") {
      // Pending approvals — teacher/admin only
      if (role !== "teacher" && role !== "admin") {
        return res.status(403).json({ success: false, message: "Not authorized" });
      }
      filter = { approvalStatus: "pending" };
    } else {
      // Own documents
      filter = { userId: req.user._id };
    }

    // Classification filters — backend uses "class" query param
    if (cls)     filter.className = cls;
    if (term)    filter.term      = term;
    if (subject) filter.subject   = subject;

    const docs = await Document.find(filter)
      .select("-extractedText -chunks")
      .sort({ createdAt: -1 });

    return res.json({ success: true, count: docs.length, documents: docs });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to fetch documents" });
  }
};
