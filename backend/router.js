import bcrypt from "bcrypt";
import dotenv from "dotenv";
import express from "express";
import multer from "multer";
import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";

import Admin from "./models/Admin.js";
import Teacher from "./models/Teacher.js"; // Import the new Teacher model
import Student from "./models/Student.js"; 

dotenv.config();

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/teachers/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "teacher-" + uniqueSuffix + path.extname(file.originalname));
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

// Generate teacher ID
const randomTeacherId = () => {
  return "Tea" + String(Math.floor(Math.random() * 99999 + 1)).padStart(5, "0");
};

// Configure email transporter
let transporter = null;

const setupEmailTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("Email credentials missing. Emails will not be sent.");
    return null;
  }

  console.log("Setting up email for:", process.env.EMAIL_USER);

  const mailer = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  mailer.verify((error, success) => {
    if (error) {
      console.error("Gmail authentication error:", error.message);
      console.log("\nGMAIL SETUP INSTRUCTIONS:");
      console.log("1. Enable 2-Factor Authentication on your Gmail");
      console.log("2. Go to: https://myaccount.google.com/apppasswords");
      console.log("3. Generate an App Password for 'Mail'");
      console.log("4. Use the 16-character app password in EMAIL_PASS");
    } else {
      console.log("Email server is ready to send messages");
    }
  });

  return mailer;
};

transporter = setupEmailTransporter();

// GET /admin/teachers - Fetch all teachers from Teacher collection
router.get("/admin/teachers", async (req, res) => {
  try {
    console.log("Fetching all teachers from Teacher collection...");

    const teachers = await Teacher.find({ isActive: true }).sort({
      createdAt: -1,
    });

    // Count students per course
    const studentCounts = await Student.aggregate([
      { $group: { _id: "$course", count: { $sum: 1 } } },
    ]);

    // Convert aggregation result into a map { courseName: count }
    const studentCountMap = {};
    studentCounts.forEach((c) => {
      studentCountMap[c._id] = c.count;
    });

    // Map teachers to match frontend format and include No_Students
    const teachersFormatted = teachers.map((teacher) => ({
      _id: teacher._id,
      teacherId: teacher.teacherId,
      TeacherIMG: teacher.teacherImg
        ? `http://localhost:5000/uploads/teachers/${path.basename(
            teacher.teacherImg
          )}`
        : null,
      FullName: teacher.fullName,
      Email: teacher.email,
      DOfB: teacher.dob,
      Course: teacher.course,
      DateJoined: teacher.dateJoined,
      Country: teacher.nation,
      isActive: teacher.isActive,
      lastLogin: teacher.lastLogin,
      createdAt: teacher.createdAt,
      No_Students: studentCountMap[teacher.course] || 0, // 👈 Add student count
    }));

    console.log("Found", teachersFormatted.length, "active teachers");
    res.json(teachersFormatted);
  } catch (err) {
    console.error("Error fetching teachers:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET /admin/teachers/stats - Get teacher statistics
router.get("/admin/teachers/stats", async (req, res) => {
  try {
    const totalTeachers = await Teacher.countDocuments();
    const activeTeachers = await Teacher.countDocuments({ isActive: true });
    const inactiveTeachers = await Teacher.countDocuments({ isActive: false });

    // Get teachers by course
    const courseStats = await Teacher.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$course", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Get recent logins (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentLogins = await Teacher.countDocuments({
      lastLogin: { $gte: thirtyDaysAgo },
      isActive: true,
    });

    res.json({
      total: totalTeachers,
      active: activeTeachers,
      inactive: inactiveTeachers,
      recentLogins,
      courseDistribution: courseStats,
    });
  } catch (err) {
    console.error("Error fetching teacher stats:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// POST /admin/add-teacher - Store in both Admin and Teacher collections
router.post(
  "/admin/add-teacher",
  upload.single("TeacherIMG"),
  async (req, res) => {
    try {
      console.log("Received add-teacher request");
      console.log("Form data:", req.body);
      console.log("Uploaded file:", req.file);

      const { Email, FullName, DOfB, Course, DateJoined, Country } = req.body;

      // Validate all fields
      if (!Email || !FullName || !DOfB || !Course || !DateJoined || !Country) {
        console.log("Missing required fields");
        return res.status(400).json({ message: "All fields are required" });
      }

      if (!req.file) {
        console.log("No image file uploaded");
        return res.status(400).json({ message: "Teacher image is required" });
      }

      // Check for duplicate email in Teacher collection
      const existingTeacher = await Teacher.findOne({
        email: Email.toLowerCase(),
      });
      if (existingTeacher) {
        console.log("Email already exists in Teacher collection:", Email);
        return res.status(400).json({
          message: "Teacher with this email already exists",
        });
      }

      // Check for duplicate email in Admin's teachers array (for backward compatibility)
      const admin = await Admin.findOne({ username: "admin" });
      if (!admin) {
        console.log("Admin not found");
        return res.status(404).json({ message: "Admin not found" });
      }

      const emailExistsInAdmin = admin.teachers.some((t) => t.email === Email);
      if (emailExistsInAdmin) {
        console.log("Email already exists in Admin teachers:", Email);
        return res.status(400).json({
          message: "Teacher with this email already exists",
        });
      }

     // GET all messages for a specific student
router.get("/messages/student/:studentId", async (req, res) => {
  try {
    const messages = await Message.find({ receiverId: req.params.studentId }).sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET messages for a student
router.get("/messages/student/:studentId", async (req, res) => {
  try {
    const messages = await Message.find({ receiverId: req.params.studentId }).sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET messages for a teacher
router.get("/messages/teacher/:teacherId", async (req, res) => {
  try {
    const messages = await Message.find({ receiverId: req.params.teacherId }).sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SEND message
router.post("/messages/send", async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body;
    if (!senderId || !receiverId || !content) return res.status(400).json({ message: "All fields required" });

    const newMessage = new Message({ senderId, receiverId, content });
    await newMessage.save();

    res.status(201).json({ message: "Message sent successfully", data: newMessage });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


      // Generate password and teacherId
      const teacherPassword = randomPassword();
      const hashedPassword = await bcrypt.hash(teacherPassword, 10);
      const teacherId = randomTeacherId();

      console.log("Creating teacher:", { teacherId, Email, FullName });

      const teacherData = {
        teacherId,
        email: Email.toLowerCase(),
        fullName: FullName,
        dob: DOfB,
        course: Course,
        dateJoined: DateJoined,
        teacherImg: req.file.path,
        nation: Country,
        password: hashedPassword,
      };

      //update password
      router.put("/admin/teachers/:id/change-password", async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const teacher = await Teacher.findOne({ teacherId: req.params.id });
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, teacher.password);
    if (!isMatch) return res.status(400).json({ message: "Old password is incorrect" });

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    teacher.password = hashedPassword;
    await teacher.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update password" });
  }
});



      // 1. Create new teacher in Teacher collection
      const newTeacher = new Teacher(teacherData);
      await newTeacher.save();
      console.log("Teacher saved to Teacher collection");

      // 2. Also add to Admin's teachers array for backward compatibility
      await Admin.updateOne(
        { username: "admin" },
        {
          $push: {
            teachers: teacherData,
          },
        }
      );
      console.log("Teacher also added to Admin collection");

      // Send email to teacher
      if (transporter) {
        try {
          console.log("Attempting to send email to:", Email);

          const mailOptions = {
            from: `"Learner Admin" <${process.env.EMAIL_USER}>`,
            to: Email,
            subject: "Your Teacher Account - Welcome!",
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #4CAF50;">Welcome to Our School Portal!</h2>
              <p>Hello <strong>${FullName}</strong>,</p>
              <p>Your teacher account has been successfully created. Here are your login credentials:</p>
              
              <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #4CAF50;">
                <h3 style="margin-top: 0; color: #333;">Login Credentials</h3>
                <p style="margin: 10px 0;"><strong>Teacher ID:</strong> <code style="background: #e0e0e0; padding: 2px 6px; border-radius: 3px;">${teacherId}</code></p>
                <p style="margin: 10px 0;"><strong>Email:</strong> <code style="background: #e0e0e0; padding: 2px 6px; border-radius: 3px;">${Email}</code></p>
                <p style="margin: 10px 0;"><strong>Temporary Password:</strong> <code style="background: #e0e0e0; padding: 2px 6px; border-radius: 3px;">${teacherPassword}</code></p>
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
            text: `Hello ${FullName},\n\nYour teacher account has been created.\n\nLogin Credentials:\nTeacher ID: ${teacherId}\nEmail: ${Email}\nTemporary Password: ${teacherPassword}\n\nLogin at: http://localhost:5173/login\n\nPlease change your password after your first login.\n\nThis is an automated message.`,
          };

          const info = await transporter.sendMail(mailOptions);
          console.log("Email sent successfully!");
          console.log("Message ID:", info.messageId);

          res.json({
            message: "Teacher added successfully and email sent!",
            teacherId,
            emailSent: true,
            imageUrl: `http://localhost:5000/uploads/teachers/${req.file.filename}`,
            teacherDetails: {
              teacherId,
              email: Email,
              fullName: FullName,
              course: Course,
              country: Country,
              createdAt: newTeacher.createdAt,
            },
          });
        } catch (emailError) {
          console.error("Email sending failed:", emailError.message);

          res.json({
            message: "Teacher added successfully, but email failed to send",
            teacherId,
            emailSent: false,
            emailError: emailError.message,
            imageUrl: `http://localhost:5000/uploads/teachers/${req.file.filename}`,
            teacherDetails: {
              teacherId,
              email: Email,
              fullName: FullName,
              password: teacherPassword,
            },
          });
        }
      } else {
        console.log("Email transporter not configured, skipping email");
        res.json({
          message: "Teacher added successfully (email not configured)",
          teacherId,
          emailSent: false,
          imageUrl: `http://localhost:5000/uploads/teachers/${req.file.filename}`,
          teacherDetails: {
            teacherId,
            email: Email,
            fullName: FullName,
            password: teacherPassword,
          },
        });
      }
    } catch (err) {
      console.error("Server error in add-teacher:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

// PUT /admin/teachers/:id - Update teacher
router.put(
  "/admin/update-teacher/:id",
  upload.single("TeacherIMG"),
  async (req, res) => {
    try {
      const teacherId = req.params.id;
      const { Email, FullName, DOfB, Course, Country } = req.body;

      const updateData = {
        email: Email?.toLowerCase(),
        fullName: FullName,
        dob: DOfB,
        course: Course,
        nation: Country,
        updatedAt: new Date(),
      };

      // If new image uploaded, add it to update data
      if (req.file) {
        updateData.teacherImg = req.file.path;
      }

      const updatedTeacher = await Teacher.findOneAndUpdate(
        { teacherId: teacherId },
        updateData,
        { new: true }
      );

      if (!updatedTeacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }

      res.json({
        message: "Teacher updated successfully",
        teacher: updatedTeacher,
      });
    } catch (err) {
      console.error("Error updating teacher:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

// DELETE teacher
// match frontend: /admin/teachers/:teacherId
router.delete("/admin/teachers/:teacherId", async (req, res) => {
  try {
    const { teacherId } = req.params;

    // 1. Delete from Teachers collection
    const deletedTeacher = await Teacher.findOneAndDelete({ teacherId });
    if (!deletedTeacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // 2. Remove from Admin.teachers array
    await Admin.updateMany({}, { $pull: { teachers: { teacherId } } });

    res.json({ message: "Teacher deleted successfully" });
  } catch (error) {
    console.error("Error deleting teacher:", error);
    res.status(500).json({ message: "Error deleting teacher" });
  }
});

// GET /admin/teachers/:id - Get specific teacher
router.get("/admin/teachers/:id", async (req, res) => {
  try {
    const teacherId = req.params.id;

    const teacher = await Teacher.findOne({ teacherId: teacherId });

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const teacherFormatted = {
      _id: teacher._id,
      teacherId: teacher.teacherId,
      TeacherIMG: teacher.teacherImg
        ? `http://localhost:5000/uploads/teachers/${path.basename(
            teacher.teacherImg
          )}`
        : null,
      FullName: teacher.fullName,
      Email: teacher.email,
      DOfB: teacher.dob,
      Course: teacher.course,
      DateJoined: teacher.dateJoined,
      Country: teacher.nation,
      isActive: teacher.isActive,
      lastLogin: teacher.lastLogin,
      createdAt: teacher.createdAt,
    };

    res.json(teacherFormatted);
  } catch (err) {
    console.error("Error fetching teacher:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// POST /admin/teachers/:teacherId/message
router.post("/teachers/:teacherId/message", async (req, res) => {
  try {
    const { senderId, senderName, content } = req.body;
    const teacher = await Teacher.findById(req.params.teacherId);
    if (!teacher) return res.status(404).json({ error: "Teacher not found" });

    teacher.messages.push({
      senderId,
      senderName,
      content,
      timestamp: new Date(),
      from: "student"
    });

    await teacher.save();
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export default router;
