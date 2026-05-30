import User from "../models/User.js";

// GET /api/users?role=student&status=pending
export const getUsers = async (req, res) => {
  try {
    const { role, status } = req.query;
    const filter = {};

    // If role not specified, return all non-admin users (including mbbs)
    if (role) filter.role = role;
    else      filter.role = { $in: ["student", "teacher", "parent", "mbbs"] };

    if (status) filter.approvalStatus = status;

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 });

    return res.json({ success: true, count: users.length, users });
  } catch (err) {
    console.error("getUsers error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};

// GET /api/users/stats — returns counts per role and status (admin only)
export const getUserStats = async (req, res) => {
  try {
    const [students, teachers, parents, mbbsStudents] = await Promise.all([
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "teacher" }),
      User.countDocuments({ role: "parent"  }),
      User.countDocuments({ role: "mbbs"    }),
    ]);
    const [pendingStudents, pendingTeachers, pendingParents, pendingMbbs] = await Promise.all([
      User.countDocuments({ role: "student", approvalStatus: "pending" }),
      User.countDocuments({ role: "teacher", approvalStatus: "pending" }),
      User.countDocuments({ role: "parent",  approvalStatus: "pending" }),
      User.countDocuments({ role: "mbbs",    approvalStatus: "pending" }),
    ]);
    return res.json({
      success: true,
      stats: {
        students:     { total: students,     pending: pendingStudents },
        teachers:     { total: teachers,     pending: pendingTeachers },
        parents:      { total: parents,      pending: pendingParents  },
        mbbsStudents: { total: mbbsStudents, pending: pendingMbbs     },
        totalPending: pendingStudents + pendingTeachers + pendingParents + pendingMbbs,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to fetch stats" });
  }
};

// PATCH /api/users/:id/approval  { action: "approve" | "reject" }
export const updateUserApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;

    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ success: false, message: "Action must be approve or reject" });
    }

    const user = await User.findById(id).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Can't change admin approval via this route
    if (user.role === "admin") {
      return res.status(403).json({ success: false, message: "Cannot change admin approval status" });
    }

    user.approvalStatus = action === "approve" ? "approved" : "rejected";
    await user.save();

    return res.json({ success: true, user });
  } catch (err) {
    console.error("updateUserApproval error:", err);
    return res.status(500).json({ success: false, message: "Failed to update approval status" });
  }
};

// PATCH /api/users/me  — update own profile fields (any authenticated user)
export const updateMe = async (req, res) => {
  try {
    const allowed = ["phone", "dateOfBirth", "image", "name"];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: "No valid fields to update" });
    }
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    return res.json({ success: true, user });
  } catch (err) {
    console.error("updateMe error:", err);
    return res.status(500).json({ success: false, message: "Failed to update profile" });
  }
};

// DELETE /api/users/:id  (admin only)
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (user.role === "admin") {
      return res.status(403).json({ success: false, message: "Cannot delete admin account" });
    }
    await user.deleteOne();
    return res.json({ success: true, message: "User deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to delete user" });
  }
};

// PATCH /api/users/:id  — admin edits any user's basic fields
export const updateUser = async (req, res) => {
  try {
    const allowed = ["name", "email", "className", "phone", "dateOfBirth", "image"];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: "No valid fields to update" });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (user.role === "admin") {
      return res.status(403).json({ success: false, message: "Cannot edit admin accounts this way" });
    }
    return res.json({ success: true, user });
  } catch (err) {
    console.error("updateUser error:", err);
    if (err.name === "ValidationError") {
      const message = Object.values(err.errors).map((e: any) => e.message).join(", ");
      return res.status(400).json({ success: false, message });
    }
    return res.status(500).json({ success: false, message: "Failed to update user" });
  }
};
