import express from "express";
import Admin from "./models/Admin.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

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

// Configure email transporter with multiple options
let transporter = null;

const setupEmailTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("⚠️ Email credentials missing. Emails will not be sent.");
    return null;
  }

  // Try different Gmail configurations
  const configs = [
    // Option 1: Gmail with App Password (most common)
    {
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    },
    // Option 2: Gmail SMTP with explicit settings
    {
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    },
    // Option 3: Gmail with less secure app access (not recommended)
    {
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    },
  ];

  console.log("📧 Setting up email for:", process.env.EMAIL_USER);

  // Try the first configuration
  const mailer = nodemailer.createTransport(configs[0]);

  // Verify email connection
  mailer.verify((error, success) => {
    if (error) {
      console.error("❌ Gmail authentication error:");
      console.error("❌", error.message);
      console.log("\n🔧 GMAIL SETUP INSTRUCTIONS:");
      console.log("1. Enable 2-Factor Authentication on your Gmail");
      console.log("2. Go to: https://myaccount.google.com/apppasswords");
      console.log("3. Generate an App Password for 'Mail'");
      console.log("4. Use the 16-character app password in EMAIL_PASS");
      console.log("5. Make sure EMAIL_USER is your full Gmail address");
      console.log("\n📧 Current EMAIL_USER:", process.env.EMAIL_USER);
      console.log(
        "📧 EMAIL_PASS length:",
        process.env.EMAIL_PASS?.length,
        "characters"
      );
    } else {
      console.log("✅ Email server is ready to send messages");
    }
  });

  return mailer;
};

// Initialize transporter
transporter = setupEmailTransporter();

// POST /admin/add-teacher
router.post("/admin/add-teacher", async (req, res) => {
  try {
    console.log("📝 Received add-teacher request:", req.body);

    // map frontend fields to backend
    const { Email, FullName, DOfB, Course, DateJoined } = req.body;

    // Validate all fields
    if (!Email || !FullName || !DOfB || !Course || !DateJoined) {
      console.log("❌ Missing required fields");
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check for duplicate email
    const admin = await Admin.findOne({ username: "admin" });
    if (!admin) {
      console.log("❌ Admin not found");
      return res.status(404).json({ message: "Admin not found" });
    }

    const emailExists = admin.teachers.some((t) => t.email === Email);
    if (emailExists) {
      console.log("❌ Email already exists:", Email);
      return res
        .status(400)
        .json({ message: "Teacher with this email already exists" });
    }

    // Generate password and teacherId
    const teacherPassword = randomPassword();
    const hashedPassword = await bcrypt.hash(teacherPassword, 10);
    const teacherId = randomTeacherId();

    console.log("👤 Creating teacher:", { teacherId, Email, FullName });

    // Add teacher under the default admin
    await Admin.updateOne(
      { username: "admin" },
      {
        $push: {
          teachers: {
            teacherId,
            email: Email,
            fullName: FullName,
            dob: DOfB,
            course: Course,
            dateJoined: DateJoined,
            password: hashedPassword,
          },
        },
      }
    );

    console.log("✅ Teacher added to database successfully");

    // Send email to teacher
    if (transporter) {
      try {
        console.log("📧 Attempting to send email to:", Email);

        const mailOptions = {
          from: `"School Admin" <${process.env.EMAIL_USER}>`,
          to: Email,
          subject: "🎓 Your Teacher Account - Welcome!",
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
        console.log("✅ Email sent successfully!");
        console.log("📧 Message ID:", info.messageId);

        res.json({
          message: "Teacher added successfully and email sent!",
          teacherId,
          emailSent: true,
          teacherDetails: {
            teacherId,
            email: Email,
            fullName: FullName,
            course: Course,
          },
        });
      } catch (emailError) {
        console.error("❌ Email sending failed:");
        console.error("❌", emailError.message);

        // Provide specific guidance based on error type
        if (emailError.message.includes("Invalid login")) {
          console.log("\n🔧 GMAIL AUTH FIX:");
          console.log("1. Make sure 2FA is enabled on your Gmail");
          console.log(
            "2. Generate App Password at: https://myaccount.google.com/apppasswords"
          );
          console.log(
            "3. Use App Password (16 chars) in EMAIL_PASS, not regular password"
          );
        }

        // Still return success for teacher creation, but note email failed
        res.json({
          message: "Teacher added successfully, but email failed to send",
          teacherId,
          emailSent: false,
          emailError: emailError.message,
          teacherDetails: {
            teacherId,
            email: Email,
            fullName: FullName,
            password: teacherPassword, // Include password in response if email fails
          },
        });
      }
    } else {
      console.log("⚠️ Email transporter not configured, skipping email");
      res.json({
        message: "Teacher added successfully (email not configured)",
        teacherId,
        emailSent: false,
        teacherDetails: {
          teacherId,
          email: Email,
          fullName: FullName,
          password: teacherPassword, // Include password in response since email not sent
        },
      });
    }
  } catch (err) {
    console.error("❌ Server error in add-teacher:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
