import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";

// Models
import Admin from "./models/Admin.js";
import Student from "./models/Student.js";
<<<<<<< Updated upstream
import Teacher from "./models/Teacher.js"; 
import teacherRoutes from "./router.js";
import studentRoutes from "./studentRoutes.js";
<<<<<<< HEAD
=======
// import messageRoutes from "./message.js";
>>>>>>> ff151720b8ea5984e62fcde9aaf3ee6ee724af47
=======
import Teacher from "./models/Teacher.js";
import Event from "./models/Events.js";

// Routes
import eventRoutes from "./routes/eventRoutes.js";  // ✅ FIXED
import attendanceRoutes from "./routes/attendance.js";
import teacherRoutes from "./routes/router.js";
import studentRoutes from "./routes/studentRoutes.js";
import registerRoutes from "./routes/registerRoutes.js";
import messageRoutes from "./routes/message.js";
>>>>>>> Stashed changes

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// File Uploads
const uploadsDir = path.join(__dirname, "uploads", "teachers");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
const studentUploadsDir = path.join(__dirname, "uploads", "students");
if (!fs.existsSync(studentUploadsDir)) {
  fs.mkdirSync(studentUploadsDir, { recursive: true });
}

// Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: { rejectUnauthorized: false },
});
transporter.verify((err) => {
  if (err) {
    console.error("❌ Gmail auth error:", err.message);
  } else {
    console.log("✅ Gmail connected successfully");
  }
});

// MongoDB Connection
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000,
    retryWrites: true,
    tls: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err.message));

// Routes
app.use("/api/events", eventRoutes);
app.use("/attendance", attendanceRoutes);
app.use("/", teacherRoutes);
app.use("/", studentRoutes);
app.use("/api", registerRoutes);
app.use("/api/messages", messageRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.send("📘 School Admin API Running...");
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
