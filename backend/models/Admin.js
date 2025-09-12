import mongoose from "mongoose";
import bcrypt from "bcrypt";

// Teacher Schema (for reference)
const teacherSchema = new mongoose.Schema({
  teacherId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  dob: { type: String, required: true },
  course: { type: String, required: true },
  dateJoined: { type: String, required: true },
  teacherImg: { type: String, required: true },
  nation: { type: String, required: true },
  password: { type: String, required: true }, // hashed
});

// Admin Schema - FIXED to use username consistently
const adminSchema = new mongoose.Schema({
  username: {
    // Changed back to username to match existing logic
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    // Keep email as optional field
    type: String,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "admin",
  },
  teachers: [
    {
      teacherId: String,
      email: String,
      fullName: String,
      dob: String,
      course: String,
      dateJoined: String,
      teacherImg: String,
      nation: String,
      password: String,
    },
  ],
  students: [
    {
      studentId: String,
      email: String,
      fullName: String,
      dob: String,
      course: String,
      gradeLevel: String,
      guardian: String,
      dateJoined: String,
      studentImg: String,
      nation: String,
      password: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash admin password before saving
adminSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

const Admin = mongoose.model("Admin", adminSchema);

// Create default admin if none exists - FIXED
async function createDefaultAdmin() {
  try {
    const existingAdmin = await Admin.findOne({ username: "admin" });
    if (!existingAdmin) {
      const defaultAdmin = new Admin({
        username: "admin",
        email: "admin@school.com", // Added email for consistency
        password: "admin123", // 👉 change this after first login!
      });
      await defaultAdmin.save();
      console.log(
        "✅ Default admin created: username=admin, password=admin123"
      );
    } else {
      console.log("ℹ️ Admin already exists, skipping creation");
    }
  } catch (error) {
    console.error("❌ Error creating default admin:", error);
  }
}

// Run once when file is imported
createDefaultAdmin();

export default Admin;
