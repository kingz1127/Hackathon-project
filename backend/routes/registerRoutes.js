import express from "express";
import Student from "../models/Student.js";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import Registration from "../models/Registration.js";
import nodemailer from "nodemailer";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Remove the temporary array - we're using database only
// let registrationSubmissions = [];

// Configure multer for passport photos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/passports');
    console.log('Upload directory:', uploadDir);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = 'passport-' + uniqueSuffix + path.extname(file.originalname);
    console.log('Generated filename:', filename);
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit
  },
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    console.log('File filter - name:', file.originalname, 'mimetype:', file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, JPG, PNG) are allowed'));
    }
  }
});

// Enhanced registration endpoint with file upload
router.post("/register", upload.single('passportPhoto'), async (req, res) => {
  try {
    console.log('Registration request received');
    console.log('Request body:', req.body);
    console.log('Uploaded file:', req.file);

    const {
      Email,
      FullName,
      DOfB,
      Course,
      Country,
      PhoneNumber,
      Grade,
      Guardian,
      GuardianPhoneNumber,
      StateOfOrigin,
      Address,
      Gender,
    } = req.body;

    // Validate required fields
    const requiredFields = [
      'Email', 'FullName', 'DOfB', 'Course', 'Country', 
      'PhoneNumber', 'Grade', 'Guardian', 'GuardianPhoneNumber', 
      'StateOfOrigin', 'Address', 'Gender'
    ];

    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: "Passport photo is required" 
      });
    }

    // Check if email already exists in registrations
    const existingSubmission = await Registration.findOne({
      Email: Email.toLowerCase(),
    });
    
    const existingStudent = await Student.findOne({
      email: Email.toLowerCase(),
    });

    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: "Email already registered as a student",
      });
    }

    // Create registration submission in database
    const submission = new Registration({
      id: `reg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      Email: Email.toLowerCase(),
      FullName,
      DOfB,
      Course,
      Country,
      PhoneNumber,
      Grade,
      Guardian,
      GuardianPhoneNumber,
      StateOfOrigin,
      Address,
      Gender,
      passportPhoto: `/uploads/passports/${req.file.filename}`,
      status: "pending",
    });

    await submission.save();
    console.log("Stored registration submission in database:", submission.id);

    // Send email to Admin
    try {
      console.log("Creating email transporter...");
      
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        tls: {
          rejectUnauthorized: false,
        }
      });

      console.log("Transporter created successfully");

      await transporter.sendMail({
        from: `"School Registration" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER,
        subject: "📩 New Registration Submission with Photo - Action Required",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #d9534f;">New Registration Submission</h2>
            <div style="background: #fff3cd; padding: 20px; border-radius: 5px; border-left: 4px solid #ffc107;">
              <h3>Student Information</h3>
              <p><strong>Full Name:</strong> ${FullName}</p>
              <p><strong>Email:</strong> ${Email}</p>
              <p><strong>Course:</strong> ${Course}</p>
              <p><strong>Phone:</strong> ${PhoneNumber}</p>
              <p><strong>Grade:</strong> ${Grade}</p>
              <p><strong>Country:</strong> ${Country}</p>
              <p><strong>Passport Photo:</strong> Uploaded ✓</p>
              <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <p style="margin-top: 20px;">
              <a href="http://localhost:5173/admin/notifications" 
                 style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                Review Submission
              </a>
            </p>
          </div>
        `
      });
      
      console.log("✅ Email sent successfully");
    } catch (emailError) {
      console.error("⚠️ Email sending failed:", emailError.message);
      // Continue anyway - don't fail registration just because email failed
    }

    res.status(201).json({ 
      success: true,
      message: "Registration submitted successfully with passport photo! It will be reviewed by administration.",
      submissionId: submission.id
    });

  } catch (error) {
    console.error("❌ Registration failed:", error);
    
    // Handle multer errors
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
          success: false,
          message: "Passport photo must be less than 2MB" 
        });
      }
      return res.status(400).json({ 
        success: false,
        message: `File upload error: ${error.message}` 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: "Failed to process registration: " + error.message 
    });
  }
});

// Get pending registration submissions for admin
router.get("/admin/pending-registrations", async (req, res) => {
  try {
    const pendingSubmissions = await Registration.find({ status: "pending" }).sort({ submittedAt: -1 });
    
    res.json({
      success: true,
      submissions: pendingSubmissions,
      count: pendingSubmissions.length,
    });
  } catch (error) {
    console.error("Error fetching pending registrations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pending registrations",
    });
  }
});

// Get all registration submissions for admin
router.get("/admin/all-registrations", async (req, res) => {
  try {
    const allSubmissions = await Registration.find({}).sort({ submittedAt: -1 });
    
    res.json({
      success: true,
      submissions: allSubmissions,
      count: allSubmissions.length,
    });
  } catch (error) {
    console.error("Error fetching all registrations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch registrations",
    });
  }
});

// Update registration status - COMPLETELY FIXED VERSION
router.put("/admin/update-registration/:submissionId", async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { status, adminNotes, reviewedBy } = req.body;

    console.log("Updating registration:", submissionId, "to:", status);
    console.log("Admin notes received:", adminNotes);

    // Find the submission in database
    const submission = await Registration.findOne({ id: submissionId });

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Registration submission not found",
      });
    }

    const previousStatus = submission.status;
    
    // Update the submission in database
    submission.status = status;
    submission.adminNotes = adminNotes || submission.adminNotes;
    submission.reviewedBy = reviewedBy || "admin";
    submission.reviewedAt = new Date();

    await submission.save();

    console.log("Updated registration in database:", submission.id);

    // Send email notifications based on status
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        tls: {
          rejectUnauthorized: false,
        }
      });

      // UNDER REVIEW EMAIL
      if (status === "under_review" && previousStatus !== "under_review") {
        await transporter.sendMail({
          from: `"School Administration" <${process.env.EMAIL_USER}>`,
          to: submission.Email,
          subject: "🔍 Your Registration is Under Review",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #17a2b8;">Registration Under Review</h2>
              <div style="background: #d1ecf1; padding: 20px; border-radius: 5px; border-left: 4px solid #17a2b8;">
                <h3>Hello, ${submission.FullName}!</h3>
                <p>Your registration application is currently under review by our administration team.</p>
                <p><strong>Application Details:</strong></p>
                <ul>
                  <li><strong>Name:</strong> ${submission.FullName}</li>
                  <li><strong>Course:</strong> ${submission.Course}</li>
                  <li><strong>Submitted:</strong> ${new Date(submission.submittedAt).toLocaleDateString()}</li>
                </ul>
                ${adminNotes ? `
                <div style="background: white; padding: 10px; border-radius: 3px; margin: 10px 0;">
                  <strong>Admin Notes:</strong> ${adminNotes}
                </div>
                ` : ''}
                <p>We will notify you once the review process is complete. This typically takes 2-3 business days.</p>
              </div>
              <p style="margin-top: 20px;">
                <strong>What's Next?</strong><br>
                You will receive another email with the final decision once the review is complete.
              </p>
              <p style="color: #6c757d; font-size: 14px; margin-top: 20px;">
                If you have any questions, please contact our administration office.
              </p>
            </div>
          `
        });
        console.log("✅ Under review email sent to:", submission.Email);
      }

      // APPROVED EMAIL (with student account creation)
      if (status === "approved" && previousStatus !== "approved") {
        try {
          // Generate student ID
          const studentId = `STU${Date.now().toString().slice(-6)}`;
          
          // Generate temporary password
          const tempPassword = Math.random().toString(36).slice(-8);
          const hashedPassword = await bcrypt.hash(tempPassword, 12);

          // Create student
          const newStudent = new Student({
            studentId,
            email: submission.Email,
            fullName: submission.FullName,
            password: hashedPassword,
            dob: submission.DOfB,
            course: submission.Course,
            gradeLevel: submission.Grade,
            phoneNumber: submission.PhoneNumber,
            guardian: submission.Guardian,
            guardianPhoneNumber: submission.GuardianPhoneNumber,
            nation: submission.Country,
            stateOfOrigin: submission.StateOfOrigin,
            address: submission.Address,
            gender: submission.Gender,
            dateJoined: new Date().toISOString().split('T')[0],
            isActive: true,
            studentImg: submission.passportPhoto || null,
            accountBalance: 0,
            financialHold: false,
            semester: 'Spring 2024',
          });

          await newStudent.save();
          
          // Update submission with student ID
          submission.studentId = studentId;
          await submission.save();

          // Send approval email with credentials
          await transporter.sendMail({
            from: `"School Administration" <${process.env.EMAIL_USER}>`,
            to: submission.Email,
            subject: "🎉 Registration Approved - Welcome to Our School!",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #28a745;">Congratulations! Registration Approved</h2>
                <div style="background: #d4edda; padding: 20px; border-radius: 5px; border-left: 4px solid #28a745;">
                  <h3>Welcome to Our School, ${submission.FullName}!</h3>
                  <p>We are pleased to inform you that your registration has been approved.</p>
                  
                  <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <h4 style="margin-top: 0;">Your Login Credentials:</h4>
                    <p><strong>Student ID:</strong> ${studentId}</p>
                    <p><strong>Temporary Password:</strong> ${tempPassword}</p>
                    <p><strong>Login Portal:</strong> <a href="http://localhost:5173/login">http://localhost:5173/login</a></p>
                  </div>
                  
                  <p><strong>Course:</strong> ${submission.Course}</p>
                  <p><strong>Start Date:</strong> ${new Date().toLocaleDateString()}</p>
                </div>
                
                <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <h4 style="color: #856404;">Important Next Steps:</h4>
                  <ul>
                    <li><strong>Login immediately</strong> and change your password</li>
                    <li>Complete your student profile</li>
                    <li>Review the student handbook</li>
                    <li>Check your class schedule</li>
                  </ul>
                </div>
                
                ${adminNotes ? `
                <div style="background: #e2e3e5; padding: 15px; border-radius: 5px;">
                  <h4>Administration Notes:</h4>
                  <p>${adminNotes}</p>
                </div>
                ` : ''}
                
                <p style="margin-top: 20px;">
                  We look forward to having you as part of our school community!
                </p>
              </div>
            `
          });
          console.log("✅ Approval email sent to:", submission.Email);

        } catch (studentError) {
          console.error("Error creating student account:", studentError);
          // Revert status if student creation fails
          submission.status = previousStatus;
          submission.reviewedAt = null;
          submission.reviewedBy = null;
          await submission.save();
          
          return res.status(500).json({
            success: false,
            message: "Failed to create student account",
          });
        }
      }

      // REJECTED EMAIL
      if (status === "rejected" && previousStatus !== "rejected") {
        await transporter.sendMail({
          from: `"School Administration" <${process.env.EMAIL_USER}>`,
          to: submission.Email,
          subject: "Registration Status Update",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #dc3545;">Registration Update</h2>
              <div style="background: #f8d7da; padding: 20px; border-radius: 5px; border-left: 4px solid #dc3545;">
                <p>Dear ${submission.FullName},</p>
                <p>We regret to inform you that your registration application has not been approved.</p>
                
                ${adminNotes ? `
                <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
                  <h4 style="margin-top: 0;">Reason for Rejection:</h4>
                  <p>${adminNotes}</p>
                </div>
                ` : '<p>Please contact administration for more details.</p>'}
                
                <p><strong>Application Details:</strong></p>
                <ul>
                  <li><strong>Name:</strong> ${submission.FullName}</li>
                  <li><strong>Course:</strong> ${submission.Course}</li>
                  <li><strong>Submitted:</strong> ${new Date(submission.submittedAt).toLocaleDateString()}</li>
                </ul>
              </div>
              
              <div style="margin-top: 20px;">
                <p><strong>Contact Information:</strong></p>
                <p>If you believe this is an error or would like to discuss your application further, 
                please contact our administration office.</p>
              </div>
              
              <p style="color: #6c757d; font-size: 14px; margin-top: 20px;">
                Thank you for your interest in our institution.
              </p>
            </div>
          `
        });
        console.log("✅ Rejection email sent to:", submission.Email);
      }

    } catch (emailError) {
      console.error("⚠️ Email sending failed:", emailError);
      // Don't fail the entire process if email fails
    }

    res.json({
      success: true,
      message: `Registration ${status} successfully`,
      submission: submission,
    });

  } catch (error) {
    console.error("Error updating registration status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update registration status",
    });
  }
});

// Get registration statistics
router.get("/admin/registration-statistics", async (req, res) => {
  try {
    const stats = await Registration.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
          approved: { $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] } },
          under_review: { $sum: { $cond: [{ $eq: ["$status", "under_review"] }, 1, 0] } },
        }
      }
    ]);

    const result = stats[0] || { total: 0, pending: 0, approved: 0, rejected: 0, under_review: 0 };

    // Course distribution
    const courseDistribution = await Registration.aggregate([
      {
        $group: {
          _id: "$Course",
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      statistics: result,
      courseDistribution,
    });
  } catch (error) {
    console.error("Error fetching registration statistics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch registration statistics",
    });
  }
});

export default router;