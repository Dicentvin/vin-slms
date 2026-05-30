import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ["student", "teacher", "admin", "parent", "candidate", "mbbs"],
      default: "student",
    },
    className: {
      type: String,
      enum: ["SS1", "SS2", "SS3", "WAEC", "JAMB", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6", "All", ""],
      default: "",
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    dateOfBirth: {
      type: String,
      default: "",
    },
    image: {
      type: String,   // URL from Cloudinary or any CDN
      default: "",
    },
    // admin = auto-approved, student/teacher = pending until admin approves
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Admin accounts are auto-approved
userSchema.pre("save", async function (next) {
  if (this.isNew && this.role === "admin") {
    this.approvalStatus = "approved";
  }
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

export default mongoose.model("User", userSchema);
