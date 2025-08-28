import mongoose from "mongoose";
import express from "express";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import Admin from "./models/Admin.js";
import cors from "cors";
import teacherRoutes from "./router.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

console.log("Mongo URI:", MONGO_URI);

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// ✅ Enhanced Admin login route with debugging - handles frontend format
app.post("/admin/login", async (req, res) => {
  try {
    console.log("🔐 Login attempt received:");
    console.log("📝 Request body:", req.body);

    const { username, password, email } = req.body;

    // Handle the frontend's conditional field structure
    const loginField = username || email;
    const loginPassword = password;

    console.log("🔍 Username field:", username);
    console.log("🔍 Email field:", email);
    console.log("🔍 Final login field:", loginField);
    console.log("🔐 Password provided:", loginPassword ? "YES" : "NO");

    if (!loginField || !loginPassword) {
      console.log("❌ Missing login credentials");
      return res
        .status(400)
        .json({ message: "Username/email and password are required" });
    }

    let admin = null;
    let teacher = null;

    // First, try to find admin by username
    if (username && !username.includes("@")) {
      console.log("🔍 Searching for admin with username:", username);
      admin = await Admin.findOne({ username: username });
      console.log("👤 Admin found:", admin ? "YES" : "NO");
    }

    // If no admin found and we have an email, search for teacher in admin's teachers array
    if (!admin && email && email.includes("@")) {
      console.log("🔍 Searching for teacher with email:", email);
      const adminDoc = await Admin.findOne({ "teachers.email": email });
      if (adminDoc) {
        teacher = adminDoc.teachers.find((t) => t.email === email);
        console.log("👨‍🏫 Teacher found:", teacher ? "YES" : "NO");
      }
    }

    // Handle admin login
    if (admin) {
      console.log("🔐 Comparing admin password...");
      const isMatch = await bcrypt.compare(loginPassword, admin.password);
      console.log("🔐 Admin password match:", isMatch ? "YES" : "NO");

      if (!isMatch) {
        console.log("❌ Admin password mismatch");
        return res
          .status(401)
          .json({ message: "Invalid username or password" });
      }

      console.log("✅ Admin login successful for:", admin.username);
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
      console.log("🔐 Comparing teacher password...");
      const isMatch = await bcrypt.compare(loginPassword, teacher.password);
      console.log("🔐 Teacher password match:", isMatch ? "YES" : "NO");

      if (!isMatch) {
        console.log("❌ Teacher password mismatch");
        return res
          .status(401)
          .json({ message: "Invalid username or password" });
      }

      console.log("✅ Teacher login successful for:", teacher.fullName);
      return res.json({
        message: "Teacher login successful",
        token: "teacher-session-token", // You can implement JWT here
        teacherId: teacher.teacherId,
        teacher: {
          id: teacher.teacherId,
          email: teacher.email,
          fullName: teacher.fullName,
          course: teacher.course,
          role: "teacher",
        },
      });
    }

    // If neither admin nor teacher found
    console.log("❌ No admin or teacher found with provided credentials");
    return res.status(401).json({ message: "Invalid username or password" });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Debug route to check admin exists
app.get("/admin/debug", async (req, res) => {
  try {
    const admins = await Admin.find({});
    console.log("📊 All admins in database:", admins.length);

    res.json({
      message: "Debug info",
      adminCount: admins.length,
      admins: admins.map((admin) => ({
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        hasPassword: !!admin.password,
        teachersCount: admin.teachers?.length || 0,
      })),
    });
  } catch (err) {
    console.error("❌ Debug error:", err);
    res.status(500).json({ message: "Debug error", error: err.message });
  }
});

// ✅ Health check route
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// ✅ Register routes
app.use("/", teacherRoutes);

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    // Check if default admin exists
    setTimeout(async () => {
      try {
        const adminCount = await Admin.countDocuments();
        console.log("👤 Total admins in database:", adminCount);

        const defaultAdmin = await Admin.findOne({ username: "admin" });
        if (defaultAdmin) {
          console.log(
            "✅ Default admin exists with username:",
            defaultAdmin.username
          );
        } else {
          console.log("⚠️ No default admin found with username 'admin'");
        }
      } catch (err) {
        console.error("❌ Error checking admin:", err);
      }
    }, 1000);
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
