import jwt    from "jsonwebtoken";
import crypto from "crypto";
import User   from "../models/User.js";
import { sendEmail, emailTemplates } from "../utils/sendEmail.js";

const CLIENT = process.env.CLIENT_URL || "http://localhost:5173";

// ── Helpers ───────────────────────────────────────────────────────────────────
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || "4d" });

const safeUser = (user) => ({
  _id:             user._id,
  name:            user.name,
  email:           user.email,
  role:            user.role,
  className:       user.className,
  phone:           user.phone      ?? "",
  dateOfBirth:     user.dateOfBirth ?? "",
  image:           user.image      ?? "",
  approvalStatus:  user.approvalStatus,
  isEmailVerified: user.isEmailVerified ?? false,
});

function makeToken() {
  const raw    = crypto.randomBytes(32).toString("hex");
  const hashed = crypto.createHash("sha256").update(raw).digest("hex");
  return { raw, hashed };
}

// ── POST /api/auth/register ───────────────────────────────────────────────────
export const register = async (req, res) => {
  try {
    const { name, email, password, role, className, phone, image } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    const allowedRoles = ["student", "teacher", "parent", "mbbs"];
    const assignedRole = allowedRoles.includes(role) ? role : "student";

    const user = await User.create({
      name,
      email,
      password,
      role:      assignedRole,
      className: (assignedRole === "student" || assignedRole === "mbbs") ? (className || "") : "",
      phone:     phone ?? "",
      image:     image ?? "",
    });

    // Send verification email (non-blocking — don't fail registration if email fails)
    try {
      const { raw, hashed } = makeToken();
      user.emailVerifyToken   = hashed;
      user.emailVerifyExpires = Date.now() + 24 * 60 * 60 * 1000;
      await user.save({ validateBeforeSave: false });

      const url = `${CLIENT}/verify-email?token=${raw}&id=${user._id}`;
      const { subject, html } = emailTemplates.verifyEmail({ name: user.name, url });
      await sendEmail({ to: user.email, subject, html });
    } catch (emailErr) {
      console.warn("Registration email failed (non-fatal):", emailErr.message);
    }

    const token = signToken(user._id);
    return res.status(201).json({ success: true, token, user: safeUser(user) });

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

// ── POST /api/auth/login ──────────────────────────────────────────────────────
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
    return res.json({ success: true, token, user: safeUser(user) });

  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ success: false, message: "Login failed" });
  }
};

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
export const getMe = async (req, res) => {
  return res.json({ success: true, user: safeUser(req.user) });
};

// ── POST /api/auth/send-verification ─────────────────────────────────────────
export const sendVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("+emailVerifyToken +emailVerifyExpires");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (user.isEmailVerified) {
      return res.status(400).json({ success: false, message: "Email is already verified" });
    }

    const { raw, hashed } = makeToken();
    user.emailVerifyToken   = hashed;
    user.emailVerifyExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await user.save({ validateBeforeSave: false });

    const url = `${CLIENT}/verify-email?token=${raw}&id=${user._id}`;
    const { subject, html } = emailTemplates.verifyEmail({ name: user.name, url });
    await sendEmail({ to: user.email, subject, html });

    return res.json({ success: true, message: "Verification email sent — check your inbox." });
  } catch (err) {
    console.error("sendVerification error:", err);
    return res.status(500).json({ success: false, message: "Failed to send verification email. Check your email settings." });
  }
};

// ── GET /api/auth/verify-email?token=RAW&id=USERID ───────────────────────────
export const verifyEmail = async (req, res) => {
  try {
    const { token, id } = req.query;
    if (!token || !id) {
      return res.status(400).json({ success: false, message: "Invalid verification link — missing token or id" });
    }

    const hashed = crypto.createHash("sha256").update(token).digest("hex");
    const user   = await User.findOne({
      _id:                id,
      emailVerifyToken:   hashed,
      emailVerifyExpires: { $gt: Date.now() },
    }).select("+emailVerifyToken +emailVerifyExpires");

    if (!user) {
      return res.status(400).json({ success: false, message: "Verification link is invalid or has expired. Please request a new one." });
    }

    user.isEmailVerified    = true;
    user.emailVerifyToken   = undefined;
    user.emailVerifyExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return res.json({ success: true, message: "Email verified successfully! You can now log in." });
  } catch (err) {
    console.error("verifyEmail error:", err);
    return res.status(500).json({ success: false, message: "Email verification failed. Please try again." });
  }
};

// ── POST /api/auth/forgot-password ───────────────────────────────────────────
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email address is required" });
    }

    // Always return success to prevent email enumeration attacks
    const successMsg = "If that email is registered, you'll receive a reset link shortly.";

    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .select("+passwordResetToken +passwordResetExpires");

    if (!user) {
      return res.json({ success: true, message: successMsg });
    }

    const { raw, hashed } = makeToken();
    user.passwordResetToken   = hashed;
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save({ validateBeforeSave: false });

    const url = `${CLIENT}/reset-password?token=${raw}&id=${user._id}`;
    const { subject, html } = emailTemplates.resetPassword({ name: user.name, url });
    await sendEmail({ to: user.email, subject, html });

    return res.json({ success: true, message: successMsg });
  } catch (err) {
    console.error("forgotPassword error:", err);
    return res.status(500).json({ success: false, message: "Failed to send reset email. Please check your email settings and try again." });
  }
};

// ── POST /api/auth/reset-password ────────────────────────────────────────────
export const resetPassword = async (req, res) => {
  try {
    const { token, id, password } = req.body;

    if (!token || !id || !password) {
      return res.status(400).json({ success: false, message: "Token, id, and new password are all required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    const hashed = crypto.createHash("sha256").update(token).digest("hex");
    const user   = await User.findOne({
      _id:                  id,
      passwordResetToken:   hashed,
      passwordResetExpires: { $gt: Date.now() },
    }).select("+password +passwordResetToken +passwordResetExpires");

    if (!user) {
      return res.status(400).json({ success: false, message: "Reset link is invalid or has expired. Please request a new one." });
    }

    user.password             = password;
    user.passwordResetToken   = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Send confirmation email (non-blocking)
    try {
      const { subject, html } = emailTemplates.passwordChanged({ name: user.name });
      await sendEmail({ to: user.email, subject, html });
    } catch (emailErr) {
      console.warn("Password-changed notification failed (non-fatal):", emailErr.message);
    }

    return res.json({ success: true, message: "Password reset successfully. You can now log in with your new password." });
  } catch (err) {
    console.error("resetPassword error:", err);
    return res.status(500).json({ success: false, message: "Password reset failed. Please try again." });
  }
};
