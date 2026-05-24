import express from "express";
import {
  register,
  login,
  getMe,
  sendVerification,
  verifyEmail,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import protect from "../middleware/auth.js";

const router = express.Router();

router.post("/register",           register);
router.post("/login",              login);
router.get ("/me",                 protect, getMe);

// Email verification
router.post("/send-verification",  protect, sendVerification);  // logged-in user requests link
router.get ("/verify-email",       verifyEmail);                 // link from email

// Password reset (public)
router.post("/forgot-password",    forgotPassword);
router.post("/reset-password",     resetPassword);

export default router;
