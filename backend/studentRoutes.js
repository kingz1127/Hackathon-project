import express from "express";
import Student from "./models/Student.js";
import Admin from "./models/Admin.js";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let transporter = null;

const setupEmailTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("Email credentials missing. Emails will not be sent.");
    return null;
  }

  console.log("Setting up email for student routes:", process.env.EMAIL_USER);

  const mailer = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  mailer.verify((error, success) => {
    if (error) {
      console.error(
        "Gmail authentication error in student routes:",
        error.message
      );
    } else {
      console.log("Student email server is ready to send messages");
    }
  });

  return mailer;
};

transporter = setupEmailTransporter();

// Configure multer for student file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/students/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "student-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

// Generate random password
const randomPassword = (length = 8) => {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let pass = "";
  for (let i = 0; i < length; i++)
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  return pass;
};

// Generate student ID
const randomStudentId = () => {
  return "STU" + String(Math.floor(Math.random() * 99999 + 1)).padStart(5, "0");
};

// GET /admin/students - Fetch all students
router.get("/admin/students", async (req, res) => {
  try {
    console.log("Fetching all students from Student collection...");

    const students = await Student.find({ isActive: true }).sort({
      createdAt: -1,
    });

    const studentsFormatted = students.map((student) => ({
      _id: student._id,
      studentId: student.studentId,
      StudentIMG: student.studentImg
        ? `http://localhost:5000/uploads/students/${path.basename(
            student.studentImg
          )}`
        : null,
      FullName: student.fullName,
      Email: student.email,
      DOfB: student.dob,
      Course: student.course,
      GradeLevel: student.gradeLevel,
      Guardian: student.guardian,
      DateJoined: student.dateJoined,
      Country: student.nation,
      isActive: student.isActive,
      lastLogin: student.lastLogin,
      createdAt: student.createdAt,
    }));

    console.log("Found", studentsFormatted.length, "active students");
    res.json(studentsFormatted);
  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// POST /admin/add-student - Add new student
router.post(
  "/admin/add-student",
  upload.single("StudentIMG"),
  async (req, res) => {
    try {
      console.log("Received add-student request");
      console.log("Form data:", req.body);
      console.log("Uploaded file:", req.file);

      const {
        Email,
        FullName,
        DOfB,
        Course,
        GradeLevel,
        Guardian,
        DateJoined,
        Country,
      } = req.body;

      // Validate all fields
      if (
        !Email ||
        !FullName ||
        !DOfB ||
        !Course ||
        !GradeLevel ||
        !Guardian ||
        !DateJoined ||
        !Country
      ) {
        console.log("Missing required fields");
        return res.status(400).json({ message: "All fields are required" });
      }

      if (!req.file) {
        console.log("No image file uploaded");
        return res.status(400).json({ message: "Student image is required" });
      }

      // Check for duplicate email in Student collection
      const existingStudent = await Student.findOne({
        email: Email.toLowerCase(),
      });
      if (existingStudent) {
        console.log("Email already exists in Student collection:", Email);
        return res.status(400).json({
          message: "Student with this email already exists",
        });
      }

      // Check for duplicate email in Admin's students array
      const admin = await Admin.findOne({ username: "admin" });
      if (!admin) {
        console.log("Admin not found");
        return res.status(404).json({ message: "Admin not found" });
      }

      const emailExistsInAdmin =
        admin.students && admin.students.some((s) => s.email === Email);
      if (emailExistsInAdmin) {
        console.log("Email already exists in Admin students:", Email);
        return res.status(400).json({
          message: "Student with this email already exists",
        });
      }

      // Generate password and studentId
      const studentPassword = randomPassword();
      const hashedPassword = await bcrypt.hash(studentPassword, 10);
      const studentId = randomStudentId();

      console.log("Creating student:", { studentId, Email, FullName });

      const studentData = {
        studentId,
        email: Email.toLowerCase(),
        fullName: FullName,
        dob: DOfB,
        course: Course,
        gradeLevel: GradeLevel,
        guardian: Guardian,
        dateJoined: DateJoined,
        studentImg: req.file.path,
        nation: Country,
        password: hashedPassword,
      };

      // 1. Create new student in Student collection
      const newStudent = new Student(studentData);
      await newStudent.save();
      console.log("Student saved to Student collection");

      // 2. Also add to Admin's students array for backward compatibility
      await Admin.updateOne(
        { username: "admin" },
        {
          $push: {
            students: studentData,
          },
        }
      );
      console.log("Student also added to Admin collection");

      // Send email to student
      if (transporter) {
        try {
          console.log("Attempting to send email to:", Email);

          const mailOptions = {
            from: `"Learner Admin" <${process.env.EMAIL_USER}>`,
            to: Email,
            subject: "Your Student Account - Welcome!",
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #4CAF50;">Welcome to Our School Portal!</h2>
              <p>Hello <strong>${FullName}</strong>,</p>
              <p>Your student account has been successfully created. Here are your login credentials:</p>
              
              <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #4CAF50;">
                <h3 style="margin-top: 0; color: #333;">Login Credentials</h3>
                <p style="margin: 10px 0;"><strong>Student ID:</strong> <code style="background: #e0e0e0; padding: 2px 6px; border-radius: 3px;">${studentId}</code></p>
                <p style="margin: 10px 0;"><strong>Email:</strong> <code style="background: #e0e0e0; padding: 2px 6px; border-radius: 3px;">${Email}</code></p>
                <p style="margin: 10px 0;"><strong>Temporary Password:</strong> <code style="background: #e0e0e0; padding: 2px 6px; border-radius: 3px;">${studentPassword}</code></p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="http://localhost:5173/login" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login to Portal</a>
              </div>
              
              <div style="background-color: #fff3cd; padding: 15px; margin: 20px 0; border-radius: 5px; border: 1px solid #ffeaa7;">
                <p style="margin: 0; color: #856404;"><strong>Security Notice:</strong> Please change your password after your first login for security purposes.</p>
              </div>
              
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
              <p style="color: #666; font-size: 12px; text-align: center;">This is an automated message. Please do not reply to this email.</p>
            </div>
          `,
            text: `Hello ${FullName},\n\nYour student account has been created.\n\nLogin Credentials:\nStudent ID: ${studentId}\nEmail: ${Email}\nTemporary Password: ${studentPassword}\n\nLogin at: http://localhost:5173/login\n\nPlease change your password after your first login.\n\nThis is an automated message.`,
          };

          const info = await transporter.sendMail(mailOptions);
          console.log("Email sent successfully!");
          console.log("Message ID:", info.messageId);

          res.json({
            message: "Student added successfully and email sent!",
            studentId,
            emailSent: true,
            imageUrl: `http://localhost:5000/uploads/students/${req.file.filename}`,
            studentDetails: {
              studentId,
              email: Email,
              fullName: FullName,
              course: Course,
              gradeLevel: GradeLevel,
              country: Country,
              createdAt: newStudent.createdAt,
            },
          });
        } catch (emailError) {
          console.error("Email sending failed:", emailError.message);

          res.json({
            message: "Student added successfully, but email failed to send",
            studentId,
            emailSent: false,
            emailError: emailError.message,
            imageUrl: `http://localhost:5000/uploads/students/${req.file.filename}`,
            studentDetails: {
              studentId,
              email: Email,
              fullName: FullName,
              password: studentPassword,
            },
          });
        }
      } else {
        console.log("Email transporter not configured, skipping email");
        res.json({
          message: "Student added successfully (email not configured)",
          studentId,
          emailSent: false,
          imageUrl: `http://localhost:5000/uploads/students/${req.file.filename}`,
          studentDetails: {
            studentId,
            email: Email,
            fullName: FullName,
            password: studentPassword,
          },
        });
      }
    } catch (err) {
      console.error("Server error in add-student:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

export default router;
