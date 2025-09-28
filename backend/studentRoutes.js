import bcrypt from "bcrypt";
import express from "express";
import multer from "multer";
import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";
import Admin from "./models/Admin.js";
import Student from "./models/Student.js";
import Teacher from "./models/Teacher.js";
import Message from "./models/Message.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let transporter = null;

// Setup Nodemailer
const setupEmailTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("Email credentials missing. Emails will not be sent.");
    return null;
  }

  const mailer = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  mailer.verify((error) => {
    if (error) {
      console.error("Gmail authentication error:", error.message);
    } else {
      console.log("Student email server ready to send messages");
    }
  });

  return mailer;
};
transporter = setupEmailTransporter();

// Multer config for uploads
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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
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
  for (let i = 0; i < length; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
};

// Generate student ID
const randomStudentId = () => {
  return "STU" + String(Math.floor(Math.random() * 99999 + 1)).padStart(5, "0");
};

// ========== ROUTES ==========

// GET all students
router.get("/admin/students", async (req, res) => {
  try {
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
      GuardianPhoneNumber: student.guardianPhoneNumber,
      PhoneNumber: student.phoneNumber,
      StateOfOrigin: student.stateOfOrigin,
      Address: student.address,
      Gender: student.gender,
      DateJoined: student.dateJoined,
      Country: student.nation,
      isActive: student.isActive,
      lastLogin: student.lastLogin,
      createdAt: student.createdAt,
    }));

    res.json(studentsFormatted);
  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get all students under a teacher's course & term level
router.get("/by-teacher/:teacherId", async (req, res) => {
  try {
    const { termLevel } = req.query; // e.g. /by-teacher/TEA123?termLevel=200

    const teacher = await Teacher.findOne({ teacherId: req.params.teacherId });
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const query = { course: teacher.course };
    if (termLevel) {
      query.gradeLevel = termLevel;
    }

    const students = await Student.find(query);

    res.json(students);
  } catch (err) {
    console.error("Error fetching students by teacher:", err);
    res.status(500).json({ error: "Failed to fetch students" });
  }
});

// GET total students for logged-in teacher
router.get("/count", async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.user.id); // from auth middleware

    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    // Count all students in this teacher's course
    const count = await Student.countDocuments({ course: teacher.course });

    res.json({ studentCount: count });
  } catch (err) {
    console.error("Error counting students:", err);
    res.status(500).json({ error: "Failed to count students" });
  }
});

// ADD student
router.post(
  "/admin/add-student",
  upload.single("StudentIMG"),
  async (req, res) => {
    try {
      const {
        Email,
        FullName,
        DOfB,
        Course,
        GradeLevel,
        Guardian,
        GuardianPhoneNumber,
        PhoneNumber,
        StateOfOrigin,
        Address,
        Gender,
        DateJoined,
        Country,
      } = req.body;

      if (
        !Email ||
        !FullName ||
        !DOfB ||
        !Course ||
        !GradeLevel ||
        !Guardian ||
        !GuardianPhoneNumber ||
        !PhoneNumber ||
        !StateOfOrigin ||
        !Address ||
        !Gender ||
        !DateJoined ||
        !Country
      ) {
        return res.status(400).json({ message: "All fields are required" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "Student image is required" });
      }

      const existingStudent = await Student.findOne({
        email: Email.toLowerCase(),
      });
      if (existingStudent) {
        return res
          .status(400)
          .json({ message: "Student with this email already exists" });
      }

      const admin = await Admin.findOne({ username: "admin" });
      if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
      }

      const emailExistsInAdmin =
        admin.students && admin.students.some((s) => s.email === Email);
      if (emailExistsInAdmin) {
        return res
          .status(400)
          .json({ message: "Student with this email already exists" });
      }

      const studentPassword = randomPassword();
      const hashedPassword = await bcrypt.hash(studentPassword, 10);
      const studentId = randomStudentId();

      const studentData = {
  studentId, // ✅ include this!
  email: Email.toLowerCase(),
  fullName: FullName,
  dob: DOfB,
  course: Course,
  gradeLevel: GradeLevel,
  guardian: Guardian,
  guardianPhoneNumber: GuardianPhoneNumber,
  phoneNumber: PhoneNumber,
  stateOfOrigin: StateOfOrigin,
  address: Address,
  gender: Gender,
  dateJoined: DateJoined,
  studentImg: req.file.path,
  nation: Country,
  password: hashedPassword,
};

      const newStudent = new Student(studentData);
      await newStudent.save();

      await Admin.updateOne(
        { username: "admin" },
        { $push: { students: studentData } }
      );

      if (transporter) {
        try {
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

          await transporter.sendMail(mailOptions);

          res.json({
            message: "Student added successfully and email sent!",
            studentId,
            emailSent: true,
            imageUrl: `http://localhost:5000/uploads/students/${req.file.filename}`,
          });
        } catch (emailError) {
          res.json({
            message: "Student added successfully, but email failed",
            studentId,
            emailSent: false,
          });
        }
      } else {
        res.json({
          message: "Student added successfully (email not configured)",
          studentId,
          emailSent: false,
        });
      }
    } catch (err) {
      console.error("Server error in add-student:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

// UPDATE student
router.put(
  "/admin/students/:studentId",
  upload.single("StudentIMG"),
  async (req, res) => {
    try {
      const { studentId } = req.params;
      const {
        Email,
        FullName,
        DOfB,
        Course,
        GradeLevel,
        Guardian,
        GuardianPhoneNumber,
        PhoneNumber,
        StateOfOrigin,
        Address,
        Gender,
        Country,
      } = req.body;

      const updateData = {
        email: Email?.toLowerCase(),
        fullName: FullName,
        dob: DOfB,
        course: Course,
        gradeLevel: GradeLevel,
        guardian: Guardian,
        guardianPhoneNumber: GuardianPhoneNumber,
        phoneNumber: PhoneNumber,
        stateOfOrigin: StateOfOrigin,
        address: Address,
        gender: Gender,
        nation: Country,
        updatedAt: new Date(),
      };

      if (req.file) {
        updateData.studentImg = req.file.path;
      }

      const updatedStudent = await Student.findOneAndUpdate(
        { studentId },
        updateData,
        { new: true }
      );

      if (!updatedStudent) {
        return res.status(404).json({ message: "Student not found" });
      }

      res.json({
        message: "Student updated successfully",
        student: updatedStudent,
      });
    } catch (err) {
      console.error("Error updating student:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

// GET one student by studentId
router.get("/admin/students/:studentId", async (req, res) => {
  try {
    const student = await Student.findOne({ studentId: req.params.studentId });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({
      _id: student._id, // ✅ Include _id for messaging
      studentId: student.studentId,
      fullName: student.fullName,
      email: student.email,
      studentImg: student.studentImg
        ? `http://localhost:5000/uploads/students/${path.basename(student.studentImg)}`
        : null,
      course: student.course || null,  
    });
  } catch (err) {
    console.error("Error fetching student:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// DELETE student
router.delete("/admin/students/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;

    const deletedStudent = await Student.findOneAndDelete({ studentId });
    if (!deletedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    await Admin.updateMany({}, { $pull: { students: { studentId } } });

    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(500).json({ message: "Error deleting student" });
  }
});

// Send a message (teacher → student or student → teacher)
router.post("/messages/send", async (req, res) => {
  try {
    const { senderId, senderName, receiverId, content } = req.body;

    if (!senderId || !receiverId || !content) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Create and save message in Message collection
    const message = new Message({ 
      senderId, 
      senderName, 
      receiverId, 
      content,
      timestamp: new Date(),
      isRead: false
    });
    
    const savedMessage = await message.save();

    // Return the saved message with all fields
    res.status(201).json({
      _id: savedMessage._id,
      senderId: savedMessage.senderId,
      senderName: savedMessage.senderName,
      receiverId: savedMessage.receiverId,
      content: savedMessage.content,
      timestamp: savedMessage.timestamp,
      isRead: savedMessage.isRead
    });
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get all messages between teacher & student (for chat history)
router.get("/messages/chat/:teacherId/:studentId", async (req, res) => {
  try {
    const { teacherId, studentId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: teacherId, receiverId: studentId },
        { senderId: studentId, receiverId: teacherId }
      ]
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (err) {
    console.error("Error fetching chat messages:", err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Get all messages received by a student (student notifications)
router.get("/messages/student/:studentId", async (req, res) => {
  try {
    const messages = await Message.find({ receiverId: req.params.studentId })
      .sort({ timestamp: -1 }); // latest first

    res.json(messages);
  } catch (err) {
    console.error("Error fetching student messages:", err);
    res.status(500).json({ error: err.message });
  }
});

// Mark a message as read
router.patch("/messages/read/:id", async (req, res) => {
  try {
    const updated = await Message.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    
    if (!updated) {
      return res.status(404).json({ error: "Message not found" });
    }
    
    res.json(updated);
  } catch (err) {
    console.error("Error marking message as read:", err);
    res.status(500).json({ error: err.message });
  }
});

// Delete a message
router.delete("/messages/:id", async (req, res) => {
  try {
    const deleted = await Message.findByIdAndDelete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({ error: "Message not found" });
    }
    
    res.json({ message: "Message deleted successfully" });
  } catch (err) {
    console.error("Error deleting message:", err);
    res.status(500).json({ error: err.message });
  }
});


export default router;