import bcrypt from "bcryptjs";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import fs from "fs";
import mongoose from "mongoose";
import multer from "multer";
import nodemailer from "nodemailer";
import path from "path";
import process from "process";
import { fileURLToPath } from "url";
import Admin from "./models/Admin.js";
import Student from "./models/Student.js";
import Teacher from "./models/Teacher.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import attendanceRoutes from "./routes/attendance.js";
import classRoutes from "./routes/classRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import gradeRoutes from "./routes/gradeRoutes.js";
import messageRoutes from "./routes/message.js";
import registerRoutes from "./routes/registerRoutes.js";
import resourceRoutes from "./routes/resourceRoutes.js";
import teacherRoutes from "./routes/router.js";
import studentRoutes from "./routes/studentRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";

// Add this to your existing server.js imports
import Payment from "./models/Payment.js";
import Receipt from "./models/Receipt.js";
import Transaction from "./models/Transaction.js";
import financeRoutes from "./routes/financeRoutes.js";
// import coursesRoutes from "./routes/coursesRoutes.js";

import paymentSubmissionRoutes from "./routes/paymentSubmissionRoutes.js";

dotenv.config();

const app = express(); 
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const passportUploadsDir = path.join(__dirname, "uploads", "passports");
if (!fs.existsSync(passportUploadsDir)) {
  fs.mkdirSync(passportUploadsDir, { recursive: true });
  console.log("Created uploads/passports directory");
}


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, 
  },
  tls: {
    rejectUnauthorized: false, 
  },
});
 

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
app.use(express.urlencoded({ extended: true })); 
app.use("/attendance", attendanceRoutes);
// app.use('/', coursesRoutes);
app.use("/", teacherRoutes);
app.use("/", studentRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/payment-submissions", paymentSubmissionRoutes);
app.use("/api", registerRoutes);
app.use("/api", registerRoutes);
app.use("/", messageRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/finance", financeRoutes);

app.use(express.urlencoded({ extended: true })); // For form data
app.use("/attendance", attendanceRoutes);app.use('/api/classes', classRoutes);
app.use('/api/assignment', assignmentRoutes);
app.use('/api/submission', submissionRoutes);
app.use('/api/grade', gradeRoutes);

const paymentUploadsDir = path.join(__dirname, "uploads", "payments");
if (!fs.existsSync(paymentUploadsDir)) {
  fs.mkdirSync(paymentUploadsDir, { recursive: true });
  console.log("Created uploads/payments directory");
}




const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "uploads/payments"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 
  },
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, JPG) and PDFs are allowed'));
    }
  }
});


app.post("/admin/login", async (req, res) => {
  try {

    const { username, password, email } = req.body;

    
    const loginField = username || email;
    const loginPassword = password;


    if (!loginField || !loginPassword) {
      console.log("Missing login credentials");
      return res
        .status(400)
        .json({ message: "Username/email and password are required" });
    }

    let admin = null;
    let teacher = null;

    
    if (username && !username.includes("@")) {
      console.log("Searching for admin with username:", username);
      admin = await Admin.findOne({ username: username });
      console.log("Admin found:", admin ? "YES" : "NO");
    }

    
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
        token: "admin-session-token", 
        admin: {
          id: admin._id,
          username: admin.username,
          email: admin.email,
          role: admin.role,
        },
      });
    }

    
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

      
      
      if (teacher._id) {
        await Teacher.findByIdAndUpdate(teacher._id, {
          lastLogin: new Date(),
        });
        console.log("Updated teacher last login time");
      }

      console.log("Teacher login successful for:", teacher.fullName);
      return res.json({
        message: "Teacher login successful",
        token: "teacher-session-token", 
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

    console.log("No admin or teacher found with provided credentials");
    return res.status(401).json({ message: "Invalid username or password" });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


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
        
        const existingTeacher = await Teacher.findOne({
          email: teacherData.email,
        });

        if (existingTeacher) {
          console.log("Teacher already exists, skipping:", teacherData.email);
          skippedCount++;
          continue;
        }

        
        const newTeacher = new Teacher({
          teacherId: teacherData.teacherId,
          email: teacherData.email,
          fullName: teacherData.fullName,
          dob: teacherData.dob,
          course: teacherData.course,
          dateJoined: teacherData.dateJoined,
          teacherImg: teacherData.teacherImg,
          nation: teacherData.nation,
          password: teacherData.password, 
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


app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});





mongoose
  .connect(MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
    retryWrites: true,
    tls: true,
  })
  .then(() => {
    console.log("MongoDB connected");
    
    setTimeout(async () => {
      try {
        const adminCount = await Admin.countDocuments();
        const teacherCount = await Teacher.countDocuments();
        const studentCount = await Student.countDocuments();
        const paymentCount = await Payment.countDocuments();
        const transactionCount = await Transaction.countDocuments();

        console.log("Total admins in database:", adminCount);
        console.log("Total teachers in Teacher collection:", teacherCount);
        console.log("Total students in the Student collection:", studentCount);
        console.log("Total payments:", paymentCount);
        console.log("Total transactions:", transactionCount);

        if (studentCount > 0 && paymentCount === 0) {
          console.log("Initializing sample financial data...");
          await initializeSampleFinanceData();
        }

        const defaultAdmin = await Admin.findOne({ username: "admin" });
        if (defaultAdmin) {
          console.log("Default admin exists with username:", defaultAdmin.username);
          console.log("Teachers in admin array:", defaultAdmin.teachers?.length || 0);
          console.log("Students in admin array:", defaultAdmin.students?.length || 0);
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




// // Add this function to create sample payments
// async function createSamplePayments() {
//   try {
//     const student = await Student.findOne({ studentId: 'STU78280' });
//     if (!student) return;

//     // Check if payments already exist
//     const existingPayments = await Payment.find({ studentId: 'STU78280' });
//     if (existingPayments.length === 0) {
//       // Create sample payments
//       const payment1 = new Payment({
//         studentId: 'STU78280',
//         amount: 2850.00,
//         description: 'Tuition Fee - Spring 2024',
//         type: 'tuition',
//         dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
//         status: 'due'
//       });
//       await payment1.save();

//       const payment2 = new Payment({
//         studentId: 'STU78280',
//         amount: 1200.00,
//         description: 'Housing Fee - Spring 2024',
//         type: 'housing',
//         dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
//         status: 'pending'
//       });
//       await payment2.save();

//       console.log('✅ Created sample payments for STU78280');
//     }
//   } catch (err) {
//     console.error('Error creating sample payments:', err);
//   }
// }
 
// Call this function in your server.js after MongoDB connects
// Add this line after your existing initialization code:
// setTimeout(createSamplePayments, 2000);


// Get student receipts
app.get('/api/finance/student/:studentId/receipts', async (req, res) => {
  try {
    const { studentId } = req.params;
    const receipts = await Receipt.find({ studentId: studentId })
      .sort({ date: -1 });
    
    res.json({ success: true, receipts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});



// Add these routes to your server.js or adminRoutes.js

// Get admin profile
app.get("/admin/profile/:adminId", async (req, res) => {
  try {
    const { adminId } = req.params;
    
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.json({
      id: admin._id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      createdAt: admin.createdAt
    });
  } catch (err) {
    console.error("Error fetching admin profile:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Request password change (sends verification email)
app.post("/admin/:adminId/request-password-change", async (req, res) => {
  try {
    const { adminId } = req.params;
    const { oldPassword, newPassword } = req.body;

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Verify old password
    const isOldPasswordValid = await bcrypt.compare(oldPassword, admin.password);
    if (!isOldPasswordValid) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Generate verification code (6 digits)
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store verification code temporarily (in production, use Redis or database)
    // For now, we'll store it in memory (reset after 10 minutes)
    const verificationData = {
      code: verificationCode,
      newPassword: newPassword,
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
    };
    
    // Simple in-memory storage (in production, use proper storage)
    global.adminVerifications = global.adminVerifications || {};
    global.adminVerifications[adminId] = verificationData;

    // Send verification email
    try {
      await transporter.sendMail({
        from: `"Learner Admin Security" <${process.env.EMAIL_USER}>`,
        to: admin.email || process.env.EMAIL_USER, // Fallback to admin email
        subject: "🔐 Admin Password Change Verification",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #007bff;">Password Change Verification</h2>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; border-left: 4px solid #007bff;">
              <h3>Hello, ${admin.username}!</h3>
              <p>You have requested to change your admin account password.</p>
              
              <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0; text-align: center;">
                <h4 style="margin: 0; color: #28a745;">Your Verification Code:</h4>
                <div style="font-size: 2.5rem; font-weight: bold; letter-spacing: 8px; color: #28a745; margin: 10px 0;">
                  ${verificationCode}
                </div>
              </div>
              
              <p><strong>Important:</strong></p>
              <ul>
                <li>This code will expire in 10 minutes</li>
                <li>Do not share this code with anyone</li>
                <li>If you didn't request this change, please contact system administration immediately</li>
              </ul>
            </div>
            <p style="color: #6c757d; font-size: 14px; margin-top: 20px;">
              This is an automated message from the School Admin System.
            </p>
          </div>
        `
      });

      console.log(`✅ Verification code sent to admin: ${admin.username}`);
      
      res.json({
        message: "Verification code sent to your email",
        email: admin.email || "admin email",
        expiresIn: "10 minutes"
      });

    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      return res.status(500).json({ message: "Failed to send verification email" });
    }

  } catch (err) {
    console.error("Error requesting password change:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Verify password change with code
app.post("/admin/:adminId/verify-password-change", async (req, res) => {
  try {
    const { adminId } = req.params;
    const { code } = req.body;

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Check if verification exists and is valid
    const verification = global.adminVerifications?.[adminId];
    if (!verification) {
      return res.status(400).json({ message: "No pending password change request found" });
    }

    if (verification.expiresAt < Date.now()) {
      delete global.adminVerifications[adminId];
      return res.status(400).json({ message: "Verification code has expired" });
    }

    if (verification.code !== code) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    // Update password
    admin.password = verification.newPassword;
    await admin.save();

    // Clean up verification data
    delete global.adminVerifications[adminId];

    console.log(`✅ Password updated for admin: ${admin.username}`);

    res.json({
      message: "Password changed successfully",
      timestamp: new Date()
    });

  } catch (err) {
    console.error("Error verifying password change:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Update admin profile (name, email)
app.put("/admin/profile/:adminId", async (req, res) => {
  try {
    const { adminId } = req.params;
    const { username, email } = req.body;

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Check if username is already taken by another admin
    if (username && username !== admin.username) {
      const existingAdmin = await Admin.findOne({ 
        username: username,
        _id: { $ne: adminId }
      });
      if (existingAdmin) {
        return res.status(400).json({ message: "Username already taken" });
      }
      admin.username = username;
    }

    // Update email if provided
    if (email) {
      admin.email = email;
    }

    admin.updatedAt = new Date();
    await admin.save();

    res.json({
      message: "Profile updated successfully",
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });

  } catch (err) {
    console.error("Error updating admin profile:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));