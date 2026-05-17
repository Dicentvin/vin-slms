import jwt from "jsonwebtoken";
import User from "../models/User.js";

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || "4d" });

const safeUser = (user) => ({
  _id:            user._id,
  name:           user.name,
  email:          user.email,
  role:           user.role,
  className:      user.className,
  approvalStatus: user.approvalStatus,
});

// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password, role, className } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    const allowedRoles = ["student", "teacher", "parent"];
    const assignedRole = allowedRoles.includes(role) ? role : "student";

    const user = await User.create({
      name,
      email,
      password,
      role: assignedRole,
      className: assignedRole === "student" ? (className || "") : "",
      // admin role is auto-approved via pre-save hook; others start as pending
    });

    const token = signToken(user._id);

    return res.status(201).json({
      success: true,
      token,
      user: safeUser(user),
    });
  } catch (err) {
    console.error("register error:", err);
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }
    if (err.name === "ValidationError") {
      const message = Object.values(err.errors).map(e => e.message).join(", ");
      return res.status(400).json({ success: false, message });
    }
    const isDev = process.env.NODE_ENV !== "production";
    return res.status(500).json({
      success: false,
      message: isDev ? `Registration failed: ${err.message}` : "Registration failed",
    });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password required" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = signToken(user._id);

    return res.json({
      success: true,
      token,
      user: safeUser(user),
    });
  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ success: false, message: "Login failed" });
  }
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  return res.json({
    success: true,
    user: safeUser(req.user),
  });
};
