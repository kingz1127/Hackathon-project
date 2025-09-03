import express from "express";
import nodemailer from "nodemailer";

const router = express.Router();

// 📩 Only send email to Admin when user registers
router.post("/register", async (req, res) => {
  try {
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

    if (
      !Email ||
      !FullName ||
      !DOfB ||
      !Course ||
      !Country ||
      !PhoneNumber ||
      !Grade ||
      !Guardian ||
      !GuardianPhoneNumber ||
      !StateOfOrigin ||
      !Address ||
      !Gender
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Setup transporter (using Gmail as example)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "osunyingboadedeji1@gmail.com", // 🔑 replace with your admin email
        pass: "zmnqzjzzxexykmav", // 🔑 use Gmail App Password
      },
    });

    // Send email to Admin
    await transporter.sendMail({
      from: `"School Registration" <${Email}>`, // student’s email appears as sender
      to: "osunyingboadedeji1@gmail.com", // admin receives it
      subject: "📩 New Registration Attempt",
      text: `
Hello Admin,

A new Student is trying to register:

- Full Name: ${FullName}
- Email: ${Email}
- DOB: ${DOfB}
- Course: ${Course}
- Country: ${Country}
- Phone Number: ${PhoneNumber}
- Grade: ${Grade}
- Guardian: ${Guardian}
- Guardian Phone Number: ${GuardianPhoneNumber}
- State of Origin: ${StateOfOrigin}
- Address: ${Address}
- Gender: ${Gender} 

Please review this request.
      `,
    });

    res
      .status(200)
      .json({ message: "Registration notification sent to admin." });
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    res.status(500).json({ message: "Failed to send email" });
  }
});

export default router;
