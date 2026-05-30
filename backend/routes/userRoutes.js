import express    from "express";
import protect    from "../middleware/auth.js";
import { adminOnly } from "../middleware/adminOnly.js";
import {
  getUsers,
  getUserStats,
  updateUserApproval,
  updateUser,
  updateMe,
  deleteUser,
} from "../controllers/userController.js";

const router = express.Router();

router.get   ("/stats",          protect, adminOnly, getUserStats);
router.patch ("/me",             protect, updateMe);              // own profile — must be before /:id
router.get   ("/",               protect, adminOnly, getUsers);
router.patch ("/:id/approval",   protect, adminOnly, updateUserApproval);
router.patch ("/:id",            protect, adminOnly, updateUser);
router.delete("/:id",            protect, adminOnly, deleteUser);

export default router;
