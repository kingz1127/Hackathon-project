import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import fs from "fs";
import mongoose from "mongoose";
import path from "path";
import process from "process";
import { fileURLToPath } from "url";
import Admin from "./models/Admin.js";
import registerRoutes from "./models/registerRoutes.js";
import Student from "./models/Student.js";
import Teacher from "./models/Teacher.js"; 
import teacherRoutes from "./router.js";
import studentRoutes from "./studentRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("Mongo URI:", MONGO_URI);

// ✅ Gmail transporter (App Password required)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Use 16-digit App Password
  },
  tls: {
    rejectUnauthorized: false, // 🔥 Fix self-signed cert error
  },
});

// ✅ Test Gmail connection
transporter.verify((err, success) => {
  if (err) {
    console.error("Gmail authentication error:", err.message);
    console.log(`
GMAIL SETUP INSTRUCTIONS:
1. Enable 2-Factor Authentication on your Gmail
2. Go to: https://myaccount.google.com/apppasswords
3. Generate an App Password for 'Mail'
4. Use the 16-character app password in EMAIL_PASS
    `);
  } else {
    console.log("✅ Gmail connected successfully");
  }
});

// Create uploads dir
const uploadsDir = path.join(__dirname, "uploads", "teachers");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("Created uploads/teachers directory");
}
const studentUploadsDir = path.join(__dirname, "uploads", "students");
if (!fs.existsSync(studentUploadsDir)) {
  fs.mkdirSync(studentUploadsDir, { recursive: true });
  console.log("Created uploads/students directory");
}

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 🔥 MongoDB Connection with DNS fallback
mongoose
  .connect(MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
    retryWrites: true,
    tls: true,
  })
  .then(() => {
    console.log("✅ MongoDB connected");

    // Debug admin count
    setTimeout(async () => {
      try {
        const adminCount = await Admin.countDocuments();
        const teacherCount = await Teacher.countDocuments();

        console.log("Total admins in database:", adminCount);
        console.log("Total teachers in Teacher collection:", teacherCount);
      } catch (err) {
        console.error("Error checking collections:", err);
      }
    }, 1000);
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    console.log(`
👉 Try these fixes:
1. Make sure you are online
2. Check your connection string in .env (use mongodb+srv:// for Atlas)
3. If SRV fails, try replacing with mongodb:// and the direct host/port
    `);
  });

// ✅ Your existing routes remain untouched
app.use("/", teacherRoutes);
app.use("/", studentRoutes);
app.use("/api", registerRoutes);
// ✅ Admin Login Route
app.post("/admin/login", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Find admin by username or email
    const admin = await Admin.findOne({
      $or: [{ username }, { email }],
    });

    if (!admin) {
      return res.status(400).json({ message: "Admin not found" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Return JSON response
    res.json({
      token: "fake-jwt-token", // TODO: Replace with real JWT
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
