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
import financeRoutes from "./routes/financeRoutes.js";

// Add these imports for the new models
import Payment from "./models/Payment.js";
import Receipt from "./models/Receipt.js";
import Transaction from "./models/Transaction.js";

import paymentSubmissionRoutes from "./routes/paymentSubmissionRoutes.js";

dotenv.config();

const app = express(); 
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ ADD THIS - Create passports directory
const passportUploadsDir = path.join(__dirname, "uploads", "passports");
if (!fs.existsSync(passportUploadsDir)) {
  fs.mkdirSync(passportUploadsDir, { recursive: true });
  console.log("Created uploads/passports directory");
}
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

app.use(express.urlencoded({ extended: true })); // For form data
app.use("/attendance", attendanceRoutes);app.use('/api/classes', classRoutes);
app.use('/', assignmentRoutes);
app.use('/', submissionRoutes);
app.use('/', gradeRoutes);

const paymentUploadsDir = path.join(__dirname, "uploads", "payments");
if (!fs.existsSync(paymentUploadsDir)) {
  fs.mkdirSync(paymentUploadsDir, { recursive: true });
  console.log("Created uploads/payments directory");
}

// =============================================
// ✅ MULTER CONFIGURATION FOR FILE UPLOADS
// =============================================

// Configure multer for file uploads
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
    fileSize: 5 * 1024 * 1024 // 5MB limit
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

// // =============================================
// // ✅ MOCK PAYMENT SYSTEM FOR ALL STUDENTS
// // =============================================




// // ✅ 1. Mock student finance overview - WORKS WITH ANY STUDENT
// app.get('/api/finance/student/:studentId/overview', async (req, res) => {
//   try {
//     const { studentId } = req.params;
//     console.log('📊 Mock student overview for:', studentId);
    
//     // Try to get student from database first
//     let student = await Student.findOne({ studentId: studentId });
    
//     if (!student) {
//       console.log('❌ Student not found in database, using mock data');
//       return res.status(404).json({ error: 'Student not found' });
//     }
    
//     // Calculate financial summary from mock payments
//     const studentPayments = mockPayments[studentId]?.payments || [];
//     const totalDue = studentPayments.reduce((sum, payment) => sum + payment.amount, 0);
//     const amountPaid = studentPayments.reduce((sum, payment) => sum + (payment.amountPaid || 0), 0);
//     const amountRemaining = totalDue - amountPaid;
//     const paymentProgress = totalDue > 0 ? (amountPaid / totalDue) * 100 : 0;
    
//     const studentData = {
//       studentInfo: {
//         name: student.fullName,
//         id: student.studentId,
//         email: student.email,
//         course: student.course,
//         gradeLevel: student.gradeLevel
//       },
//       financialSummary: {
//         totalDue: totalDue,
//         amountPaid: amountPaid,
//         amountRemaining: amountRemaining,
//         accountBalance: 0,
//         paymentProgress: paymentProgress
//       },
//       paymentDistribution: [
//         { category: "Tuition", amount: 2850.00, percentage: 70, color: "#3b82f6" },
//         { category: "Housing", amount: 1200.00, percentage: 30, color: "#ef4444" }
//       ],
//       recentTransactions: studentPayments
//         .filter(p => p.amountPaid > 0)
//         .map(p => ({
//           id: p._id,
//           description: p.description,
//           amount: -p.amountPaid,
//           date: new Date().toISOString(),
//           type: "payment"
//         })),
//       paymentHistory: [],
//       upcomingPayments: studentPayments
//         .filter(p => p.amountRemaining > 0)
//         .map(p => ({
//           id: p._id,
//           description: p.description,
//           amount: p.amountRemaining,
//           dueDate: p.dueDate,
//           status: p.status
//         }))
//     };
    
//     res.json(studentData);
//   } catch (error) {
//     console.error('Mock overview error:', error);
//     res.status(500).json({ error: error.message });
//   }
// });

// // ✅ 2. Mock student payments - WORKS WITH ANY STUDENT
// app.get('/api/finance/student/:studentId/payments', (req, res) => {
//   try {
//     const { studentId } = req.params;
//     console.log('💰 Mock payments for:', studentId);
    
//     // Return payments for this student, or empty array if no payments exist
//     const payments = mockPayments[studentId] || { payments: [] };
    
//     console.log(`📋 Found ${payments.payments.length} payments for ${studentId}`);
//     res.json(payments);
//   } catch (error) {
//     console.error('Mock payments error:', error);
//     res.status(500).json({ error: error.message });
//   }
// });

// // ✅ 3. Mock payment submission - WORKS WITH ANY STUDENT
// app.post('/api/payment-submissions/submit-payment', upload.single('receipt'), (req, res) => {
//   try {
//     console.log('📨 Mock payment submission received:', req.body);
    
//     const {
//       paymentId,
//       studentId,
//       amount,
//       paymentMethod,
//       transactionId,
//       notes
//     } = req.body;

//     if (!studentId || !amount || !paymentId) {
//       return res.status(400).json({
//         success: false,
//         message: 'Student ID, amount, and payment ID are required'
//       });
//     }

//     // Find the original payment for this student
//     const studentPayments = mockPayments[studentId]?.payments || [];
//     const originalPayment = studentPayments.find(p => 
//       p._id === paymentId || p.id === paymentId
//     );
    
//     if (!originalPayment) {
//       return res.status(404).json({
//         success: false,
//         message: 'Original payment not found'
//       });
//     }
    
//     // Get student name from database or use placeholder
//     let studentName = `Student ${studentId}`;
//     Student.findOne({ studentId: studentId })
//       .then(student => {
//         if (student) {
//           studentName = student.fullName;
//         }
//       })
//       .catch(err => {
//         console.log('Could not fetch student name, using placeholder');
//       });

//     const submission = {
//       submissionId: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
//       originalPaymentId: paymentId,
//       studentId: studentId,
//       studentName: studentName,
//       amount: parseFloat(amount),
//       paymentMethod: paymentMethod || 'bank_transfer',
//       transactionId: transactionId || `txn_${Date.now()}`,
//       notes: notes || '',
//       receiptFile: req.file ? `/uploads/payments/${req.file.filename}` : null,
//       status: 'pending',
//       submittedAt: new Date().toISOString(),
//       paymentDescription: originalPayment?.description || `Payment for ${paymentId}`,
//       _id: `mock_${Date.now()}`
//     };

//     mockPaymentSubmissions.push(submission);
//     console.log(`✅ Mock payment submission saved for ${studentId}:`, submission.submissionId);

//     res.status(201).json({
//       success: true,
//       message: 'Payment submitted for review',
//       submissionId: submission.submissionId
//     });

//   } catch (error) {
//     console.error('Mock submission error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to submit payment: ' + error.message
//     });
//   }
// });

// // ✅ 4. Mock admin payment submissions
// app.get('/api/payment-submissions/admin/all-submissions', (req, res) => {
//   try {
//     console.log('📋 Mock all submissions requested');
    
//     res.json({
//       success: true,
//       submissions: mockPaymentSubmissions
//     });
//   } catch (error) {
//     console.error('Mock all submissions error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch submissions'
//     });
//   }
// });

// // ✅ 5. Mock admin pending submissions
// app.get('/api/payment-submissions/admin/pending-submissions', (req, res) => {
//   try {
//     const pending = mockPaymentSubmissions.filter(sub => sub.status === 'pending');
//     console.log('📋 Mock pending submissions:', pending.length);
    
//     res.json({
//       success: true,
//       submissions: pending
//     });
//   } catch (error) {
//     console.error('Mock pending submissions error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch pending submissions'
//     });
//   }
// });

// // ✅ 6. Mock update payment status - WORKS WITH ANY STUDENT
// app.put('/api/payment-submissions/admin/update-status/:submissionId', (req, res) => {
//   try {
//     const { submissionId } = req.params;
//     const { status, adminNotes } = req.body;

//     console.log('🔄 Mock updating submission:', submissionId, 'to:', status);

//     if (!submissionId || submissionId === 'undefined') {
//       console.log('❌ Invalid submission ID received');
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid submission ID'
//       });
//     }

//     // Find the submission
//     const submissionIndex = mockPaymentSubmissions.findIndex(sub => 
//       sub.submissionId === submissionId
//     );
    
//     if (submissionIndex === -1) {
//       console.log('❌ Submission not found');
//       return res.status(404).json({
//         success: false,
//         message: 'Submission not found'
//       });
//     }

//     const submission = mockPaymentSubmissions[submissionIndex];
//     const studentId = submission.studentId;

//     // Update the submission
//     mockPaymentSubmissions[submissionIndex].status = status;
//     mockPaymentSubmissions[submissionIndex].adminNotes = adminNotes;
//     mockPaymentSubmissions[submissionIndex].reviewedAt = new Date().toISOString();

//     console.log(`✅ Submission updated for student ${studentId}:`, submission.submissionId);

//     // If approved, update the mock payment
//     if (status === 'approved') {
//       const studentPayments = mockPayments[studentId]?.payments || [];
//       const originalPayment = studentPayments.find(p => 
//         p._id === submission.originalPaymentId || p.id === submission.originalPaymentId
//       );
      
//       if (originalPayment) {
//         originalPayment.amountPaid = (originalPayment.amountPaid || 0) + submission.amount;
//         originalPayment.amountRemaining = Math.max(0, originalPayment.amount - originalPayment.amountPaid);
        
//         // Update payment status
//         if (originalPayment.amountPaid >= originalPayment.amount) {
//           originalPayment.status = 'completed';
//         } else if (originalPayment.amountPaid > 0) {
//           originalPayment.status = 'partial';
//         }
        
//         console.log(`✅ Mock payment updated for ${studentId}:`, {
//           paymentId: originalPayment._id,
//           amountPaid: originalPayment.amountPaid,
//           remaining: originalPayment.amountRemaining,
//           status: originalPayment.status
//         });
//       } else {
//         console.log('⚠️ Original payment not found for:', submission.originalPaymentId);
//       }
//     }

//     console.log('✅ Submission update completed successfully');
    
//     res.json({
//       success: true,
//       message: `Payment ${status} successfully`,
//       submission: mockPaymentSubmissions[submissionIndex]
//     });

//   } catch (error) {
//     console.error('❌ Mock update status error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to update payment status: ' + error.message
//     });
//   }
// });

// // ✅ 7. Student data for sidebar - FROM DATABASE
// app.get('/api/students/:studentId', async (req, res) => {
//   try {
//     const { studentId } = req.params;
//     console.log('👤 Fetching student data for:', studentId);
    
//     const student = await Student.findOne({ studentId: studentId });
    
//     if (!student) {
//       return res.status(404).json({ error: 'Student not found' });
//     }
    
//     res.json({
//       studentId: student.studentId,
//       fullName: student.fullName,
//       email: student.email,
//       course: student.course,
//       gradeLevel: student.gradeLevel
//     });
//   } catch (error) {
//     console.error('Student fetch error:', error);
//     res.status(500).json({ error: error.message });
//   }
// });


// // Initialize mock payments when server starts


// console.log('✅ MOCK PAYMENT SYSTEM ACTIVATED - Works with all students in database');

// // =============================================
// // ✅ END OF MOCK PAYMENT SYSTEM
// // =============================================

// Register routes
app.use("/", teacherRoutes);
app.use("/", studentRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/payment-submissions", paymentSubmissionRoutes);
// Mount the register route
app.use("/api", registerRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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

        // Initialize sample financial data if needed (optional - for testing)
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

// Optional: Sample data initialization function
// Updated sample data initialization function - NO AUTO BALANCE
// In your server.js - UPDATED VERSION (no auto-balance)
async function initializeSampleFinanceData() {
  try {
    const students = await Student.find({ isActive: true }).limit(5);
    
    for (const student of students) {
      // Only create payment plans and sample payments
      // const existingPlan = await PaymentPlan.findOne({ studentId: student.studentId });
      // if (!existingPlan) {
      //   const paymentPlan = new PaymentPlan({
      //     studentId: student.studentId,
      //     planType: 'standard',
      //     monthlyAmount: 1250.00,
      //     totalAmount: 12500.00,
      //     remainingAmount: 12500.00,
      //     numberOfPayments: 10,
      //     remainingPayments: 10,
      //     nextPaymentDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      //     startDate: new Date(),
      //     endDate: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000),
      //     isActive: true,
      //     status: 'active'
      //   });
      //   await paymentPlan.save();
      // }

      // // Create sample payments but DON'T set student balance
      // const existingPayments = await Payment.find({ studentId: student.studentId });
      // if (existingPayments.length === 0) {
      //   const payment1 = new Payment({
      //     studentId: student.studentId,
      //     amount: 2850.00,
      //     description: 'Tuition Fee - Spring 2024',
      //     type: 'tuition',
      //     dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      //     status: 'due'
      //   });
      //   await payment1.save();

      //   const payment2 = new Payment({
      //     studentId: student.studentId,
      //     amount: 1200.00,
      //     description: 'Housing Fee - Spring 2024',
      //     type: 'housing',
      //     dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      //     status: 'pending'
      //   });
      //   await payment2.save();
      // }

      // ⚠️ REMOVED: No auto-balance setting
    }

    console.log("✅ Sample financial data initialization completed");
  } catch (err) {
    console.error("Error initializing sample data:", err);
  }
}

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
app.use("/", messageRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/finance", financeRoutes);

// Add this function to create sample payments
async function createSamplePayments() {
  try {
    const student = await Student.findOne({ studentId: 'STU78280' });
    if (!student) return;

    // Check if payments already exist
    const existingPayments = await Payment.find({ studentId: 'STU78280' });
    if (existingPayments.length === 0) {
      // Create sample payments
      const payment1 = new Payment({
        studentId: 'STU78280',
        amount: 2850.00,
        description: 'Tuition Fee - Spring 2024',
        type: 'tuition',
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        status: 'due'
      });
      await payment1.save();

      const payment2 = new Payment({
        studentId: 'STU78280',
        amount: 1200.00,
        description: 'Housing Fee - Spring 2024',
        type: 'housing',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        status: 'pending'
      });
      await payment2.save();

      console.log('✅ Created sample payments for STU78280');
    }
  } catch (err) {
    console.error('Error creating sample payments:', err);
  }
}

// Call this function in your server.js after MongoDB connects
// Add this line after your existing initialization code:
setTimeout(createSamplePayments, 2000);


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

// // Send receipt to student
// app.post('/api/finance/admin/receipts/:receiptId/send', async (req, res) => {
//   try {
//     const { receiptId } = req.params;
//     const { studentId, sendEmail } = req.body;
    
//     // Update receipt to mark as sent to student
//     const receipt = await Receipt.findByIdAndUpdate(
//       receiptId,
//       { 
//         sentToStudent: true,
//         sentDate: new Date()
//       },
//       { new: true }
//     );
    
//     if (sendEmail) {
//       // Send email logic here
//       // You can use your existing nodemailer setup
//     }
    
//     res.json({ success: true, receipt });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// /// Get receipt by ID - ADD THIS TO YOUR SERVER.JS
// app.get('/api/finance/receipt/:receiptId', async (req, res) => {
//   try {
//     const { receiptId } = req.params;
//     console.log('📄 Fetching receipt:', receiptId);
    
//     // First try to find in Transaction collection (since you might not have Receipt model)
//     let receipt = await Transaction.findById(receiptId);
    
//     if (receipt) {
//       // Transform transaction to receipt format
//       const transformedReceipt = {
//         _id: receipt._id,
//         id: receipt._id.toString(),
//         receiptNumber: `RCP-${receipt._id.toString().slice(-8)}`,
//         student: receipt.studentName || receipt.student || 'Student',
//         studentId: receipt.studentId || 'N/A',
//         studentEmail: receipt.studentEmail || 'N/A',
//         studentCourse: receipt.course || 'N/A',
//         date: receipt.date || receipt.createdAt || new Date(),
//         time: new Date().toLocaleTimeString(),
//         transactionId: receipt._id.toString(),
//         paymentMethod: receipt.paymentMethod || 'Online',
//         items: [
//           {
//             description: receipt.description || 'Payment',
//             amount: Math.abs(receipt.amount) || 0
//           }
//         ],
//         subtotal: Math.abs(receipt.amount) || 0,
//         tax: 0,
//         total: Math.abs(receipt.amount) || 0,
//         status: receipt.status || 'completed',
//         balanceInfo: {
//           totalDue: Math.abs(receipt.amount) || 0,
//           totalPaid: Math.abs(receipt.amount) || 0,
//           balanceRemaining: 0
//         }
//       };
      
//       console.log('✅ Found and transformed receipt:', transformedReceipt.id);
//       return res.json({ success: true, receipt: transformedReceipt });
//     }
    
//     // If not found in Transaction, try to create from payment data
//     const payment = await Payment.findById(receiptId);
//     if (payment) {
//       const student = await Student.findOne({ studentId: payment.studentId });
//       const transformedReceipt = {
//         _id: payment._id,
//         id: payment._id.toString(),
//         receiptNumber: `PMT-${payment._id.toString().slice(-8)}`,
//         student: student?.fullName || payment.studentName || 'Student',
//         studentId: payment.studentId || 'N/A',
//         studentEmail: student?.email || 'N/A',
//         studentCourse: student?.course || 'N/A',
//         date: payment.createdAt || new Date(),
//         time: new Date().toLocaleTimeString(),
//         transactionId: payment._id.toString(),
//         paymentMethod: 'Online',
//         items: [
//           {
//             description: payment.description || 'Payment',
//             amount: payment.amount || 0
//           }
//         ],
//         subtotal: payment.amount || 0,
//         tax: 0,
//         total: payment.amount || 0,
//         status: 'completed',
//         balanceInfo: {
//           totalDue: payment.amount || 0,
//           totalPaid: payment.amountPaid || 0,
//           balanceRemaining: Math.max(0, (payment.amount || 0) - (payment.amountPaid || 0))
//         }
//       };
      
//       console.log('✅ Created receipt from payment:', transformedReceipt.id);
//       return res.json({ success: true, receipt: transformedReceipt });
//     }
    
//     // If nothing found, return 404
//     console.log('❌ Receipt not found:', receiptId);
//     return res.status(404).json({ 
//       success: false, 
//       message: 'Receipt not found' 
//     });
    
//   } catch (error) {
//     console.error('❌ Error fetching receipt:', error);
//     res.status(500).json({ 
//       success: false, 
//       error: error.message 
//     });
//   }
// });

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));