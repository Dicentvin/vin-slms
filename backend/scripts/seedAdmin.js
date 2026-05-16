/**
 * seedAdmin.js
 * Run once to create the admin account:
 *   node scripts/seedAdmin.js
 *
 * This script connects to MongoDB, checks if the admin already exists,
 * and creates it if not. Safe to run multiple times.
 */

import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// ── Inline minimal User schema (avoids circular import issues) ──────────────
const userSchema = new mongoose.Schema(
  {
    name:           { type: String, required: true, trim: true },
    email:          { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:       { type: String, required: true, select: false },
    role:           { type: String, enum: ["student","teacher","admin","parent"], default: "student" },
    className:      { type: String, default: "" },
    approvalStatus: { type: String, enum: ["pending","approved","rejected"], default: "pending" },
  },
  { timestamps: true }
);

const User = mongoose.models.User ?? mongoose.model("User", userSchema);

// ── Admin credentials ────────────────────────────────────────────────────────
const ADMIN = {
  name:     "Vincent",
  email:    "vincent@chukwudiacademy.com",   // change if needed
  password: "centvin213",
  role:     "admin",
  approvalStatus: "approved",
};

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("✅ Connected to MongoDB");

    const existing = await User.findOne({ email: ADMIN.email });
    if (existing) {
      console.log(`ℹ️  Admin already exists: ${existing.name} <${existing.email}>`);
      process.exit(0);
    }

    const hashed = await bcrypt.hash(ADMIN.password, 10);
    const admin  = await User.create({ ...ADMIN, password: hashed });

    console.log("🎉 Admin account created successfully!");
    console.log(`   Name  : ${admin.name}`);
    console.log(`   Email : ${admin.email}`);
    console.log(`   Role  : ${admin.role}`);
    console.log(`   Status: ${admin.approvalStatus}`);
    console.log("");
    console.log("   Login credentials:");
    console.log(`   Username / Email : ${admin.email}`);
    console.log(`   Password         : ${ADMIN.password}`);
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
