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
import attendanceRoutes from "./attendance.js";
import messageRoutes from "./message.js";
import Admin from "./models/Admin.js";
import registerRoutes from "./models/registerRoutes.js";
import Student from "./models/Student.js";
import Teacher from "./models/Teacher.js"; 
import teacherRoutes from "./router.js";
import studentRoutes from "./studentRoutes.js";
// <<<<<<< HEAD
// =======
// import messageRoutes from "./message.js";
// >>>>>>> ff151720b8ea5984e62fcde9aaf3ee6ee724af47

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


app.use("/attendance", attendanceRoutes);


// Enhanced Admin login route - checks both Admin collection and Teacher collection
app.post("/admin/login", async (req, res) => {
  try {
    console.log("Login attempt received:");
    console.log("Request body:", req.body);

    const { username, password, email } = req.body;

    // Handle the frontend's conditional field structure
    const loginField = username || email;
    const loginPassword = password;

    console.log("Username field:", username);
    console.log("Email field:", email);
    console.log("Final login field:", loginField);
    console.log("Password provided:", loginPassword ? "YES" : "NO");

    if (!loginField || !loginPassword) {
      console.log("Missing login credentials");
      return res
        .status(400)
        .json({ message: "Username/email and password are required" });
    }

    let admin = null;
    let teacher = null;

    // First, try to find admin by username
    if (username && !username.includes("@")) {
      console.log("Searching for admin with username:", username);
      admin = await Admin.findOne({ username: username });
      console.log("Admin found:", admin ? "YES" : "NO");
    }

    // If no admin found and we have an email, search for teacher in Teacher collection
    if (!admin && email && email.includes("@")) {
      console.log("Searching for teacher with email:", email);
      teacher = await Teacher.findOne({
        email: email.toLowerCase(),
        isActive: true,
      });
      console.log(
        "Teacher found in Teacher collection:",
        teacher ? "YES" : "NO"
      );

      // If not found in Teacher collection, search in Admin's teachers array for backward compatibility
      if (!teacher) {
        console.log(
          "Searching in Admin's teachers array for backward compatibility"
        );
        const adminDoc = await Admin.findOne({
          "teachers.email": email.toLowerCase(),
        });
        if (adminDoc) {
          teacher = adminDoc.teachers.find(
            (t) => t.email === email.toLowerCase()
          );
          console.log(
            "Teacher found in Admin collection:",
            teacher ? "YES" : "NO"
          );
        }
      }
    }

    // Handle admin login
    if (admin) {
      console.log("Comparing admin password...");
      const isMatch = await bcrypt.compare(loginPassword, admin.password);
      console.log("Admin password match:", isMatch ? "YES" : "NO");

      if (!isMatch) {
        console.log("Admin password mismatch");
        return res
          .status(401)
          .json({ message: "Invalid username or password" });
      }

      console.log("Admin login successful for:", admin.username);
      return res.json({
        message: "Admin login successful",
        token: "admin-session-token", // You can implement JWT here
        admin: {
          id: admin._id,
          username: admin.username,
          email: admin.email,
          role: admin.role,
        },
      });
    }

    // Handle teacher login
    if (teacher) {
      console.log("Comparing teacher password...");
      const isMatch = await bcrypt.compare(loginPassword, teacher.password);
      console.log("Teacher password match:", isMatch ? "YES" : "NO");

      if (!isMatch) {
        console.log("Teacher password mismatch");
        return res
          .status(401)
          .json({ message: "Invalid username or password" });
      }

      
      // Update last login time if teacher is from Teacher collection
      if (teacher._id) {
        await Teacher.findByIdAndUpdate(teacher._id, {
          lastLogin: new Date(),
        });
        console.log("Updated teacher last login time");
      }

      console.log("Teacher login successful for:", teacher.fullName);
      return res.json({
        message: "Teacher login successful",
        token: "teacher-session-token", // You can implement JWT here
        teacherId: teacher.teacherId,
        teacher: {
          id: teacher.teacherId,
          email: teacher.email,
          fullName: teacher.fullName,
          course: teacher.course,
          nation: teacher.nation,
          role: "teacher",
        },
      });
    }

    // Handle student login
    if (!admin && !teacher) {
      console.log("Searching for student with email:", email);
      const student = await Student.findOne({
        email: email.toLowerCase(),
        isActive: true,
      });
      console.log("Student found:", student ? "YES" : "NO");

      if (student) {
        console.log("Comparing student password...");
        const isMatch = await bcrypt.compare(loginPassword, student.password);
        console.log("Student password match:", isMatch ? "YES" : "NO");

        if (!isMatch) {
          console.log("Student password mismatch");
          return res
            .status(401)
            .json({ message: "Invalid username or password" });
        }

        // Update last login time
        await Student.findByIdAndUpdate(student._id, {
          lastLogin: new Date(),
        });
        console.log("Updated student last login time");

        console.log("Student login successful for:", student.fullName);
        return res.json({
          message: "Student login successful",
          token: "student-session-token",
          studentId: student.studentId,
          student: {
            id: student.studentId,
            email: student.email,
            fullName: student.fullName,
            course: student.course,
            gradeLevel: student.gradeLevel,
            nation: student.nation,
            role: "student",
          },
        });
      }
    }

    // If neither admin nor teacher found
    console.log("No admin or teacher found with provided credentials");
    return res.status(401).json({ message: "Invalid username or password" });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Debug route to check admin and teacher collections
app.get("/admin/debug", async (req, res) => {
  try {
    const admins = await Admin.find({});
    const teachers = await Teacher.find({});

    console.log("All admins in database:", admins.length);
    console.log("All teachers in Teacher collection:", teachers.length);

    res.json({
      message: "Debug info",
      adminCount: admins.length,
      teacherCount: teachers.length,
      admins: admins.map((admin) => ({
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        hasPassword: !!admin.password,
        teachersInArrayCount: admin.teachers?.length || 0,
      })),
      teachersFromCollection: teachers.map((teacher) => ({
        id: teacher._id,
        teacherId: teacher.teacherId,
        email: teacher.email,
        fullName: teacher.fullName,
        course: teacher.course,
        isActive: teacher.isActive,
        hasPassword: !!teacher.password,
        createdAt: teacher.createdAt,
      })),
    });
  } catch (err) {
    console.error("Debug error:", err);
    res.status(500).json({ message: "Debug error", error: err.message });
  }
});

// Migration route to move teachers from Admin array to Teacher collection
app.post("/admin/migrate-teachers", async (req, res) => {
  try {
    console.log("Starting teacher migration...");

    const admin = await Admin.findOne({ username: "admin" });
    if (!admin || !admin.teachers || admin.teachers.length === 0) {
      return res.json({
        message: "No teachers found in Admin collection to migrate",
        migrated: 0,
      });
    }

    let migratedCount = 0;
    let skippedCount = 0;

    for (const teacherData of admin.teachers) {
      try {
        // Check if teacher already exists in Teacher collection
        const existingTeacher = await Teacher.findOne({
          email: teacherData.email,
        });

        if (existingTeacher) {
          console.log("Teacher already exists, skipping:", teacherData.email);
          skippedCount++;
          continue;
        }

        // Create new teacher in Teacher collection
        const newTeacher = new Teacher({
          teacherId: teacherData.teacherId,
          email: teacherData.email,
          fullName: teacherData.fullName,
          dob: teacherData.dob,
          course: teacherData.course,
          dateJoined: teacherData.dateJoined,
          teacherImg: teacherData.teacherImg,
          nation: teacherData.nation,
          password: teacherData.password, // Already hashed
          isActive: true,
        });

        await newTeacher.save();
        migratedCount++;
        console.log("Migrated teacher:", teacherData.email);
      } catch (error) {
        console.error("Error migrating teacher", teacherData.email, ":", error);
      }
    }

    console.log(
      "Migration completed. Migrated:",
      migratedCount,
      "Skipped:",
      skippedCount
    );

    res.json({
      message: "Teacher migration completed",
      migrated: migratedCount,
      skipped: skippedCount,
      total: admin.teachers.length,
    });
  } catch (err) {
    console.error("Migration error:", err);
    res.status(500).json({ message: "Migration error", error: err.message });
  }
});

// Health check route
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Register routes
app.use("/", teacherRoutes);
app.use("/", studentRoutes);
// Mount the register route
app.use("/api", registerRoutes);

mongoose
  .connect(MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
    retryWrites: true,
    tls: true,
  })
  .then(() => {
    console.log("MongoDB connected");
    // Check if default admin exists
    setTimeout(async () => {
      try {
        const adminCount = await Admin.countDocuments();
        const teacherCount = await Teacher.countDocuments();
        const studentCount = await Student.countDocuments();

        console.log("Total admins in database:", adminCount);
        console.log("Total teachers in Teacher collection:", teacherCount);

        const defaultAdmin = await Admin.findOne({ username: "admin" });
        if (defaultAdmin) {
          console.log(
            "Default admin exists with username:",
            defaultAdmin.username
          );
          console.log(
            "Teachers in admin array:",
            defaultAdmin.teachers?.length || 0
          );
        } else {
          console.log("No default admin found with username 'admin'");
        }
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
