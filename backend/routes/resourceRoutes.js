// routes/resourceRoutes.js
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Teacher from "../models/Teacher.js";

const router = express.Router();

// ✅ Ensure uploads/resources directory exists
const resourceDir = "uploads/resources";
if (!fs.existsSync(resourceDir)) {
  fs.mkdirSync(resourceDir, { recursive: true });
  console.log("✅ Created uploads/resources directory");
}

// ✅ File upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, resourceDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// ✅ Upload resource (teacher uploads)
router.post("/upload/:teacherId", upload.single("file"), async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { title, description } = req.body;

    const teacher = await Teacher.findOne({ teacherId });
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    const resource = {
      title,
      description,
      fileUrl: `/uploads/resources/${req.file.filename}`,
      fileType: path.extname(req.file.originalname),
      uploadedAt: new Date(),
    };

    // ✅ Ensure teacher has resources array
    if (!teacher.resources) teacher.resources = [];

    teacher.resources.push(resource);
    await teacher.save();

    res.status(201).json({ message: "Resource uploaded successfully", resource });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Fetch all resources for a teacher
router.get("/:teacherId", async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ teacherId: req.params.teacherId });
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    res.json(teacher.resources || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Download resource file
router.get("/download/:filename", (req, res) => {
  const filePath = path.join(resourceDir, req.params.filename);
  res.download(filePath);
});

// ✅ Fetch resources for a student (match by course)
router.get("/student/:studentId", async (req, res) => {
  try {
    const Student = (await import("../models/Student.js")).default;
    const student = await Student.findOne({ studentId: req.params.studentId });

    if (!student) return res.status(404).json({ message: "Student not found" });

    // ✅ Find all teachers teaching the same course
    const teachers = await Teacher.find({ course: student.course });

    if (!teachers || teachers.length === 0) {
      return res.status(404).json({ message: "No teachers found for this course" });
    }

    // ✅ Combine all resources from those teachers
    const allResources = teachers.flatMap((t) => t.resources || []);

    res.json(allResources);
  } catch (err) {
    console.error("Error fetching student resources:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Delete a resource (teacher deletes uploaded file)
router.delete("/delete/:teacherId/:filename", async (req, res) => {
  try {
    const { teacherId, filename } = req.params;

    // ✅ Find the teacher in MongoDB
    const teacher = await Teacher.findOne({ teacherId });
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    // ✅ Find the resource inside the teacher’s resources array
    const resourceIndex = teacher.resources.findIndex((r) =>
      r.fileUrl.endsWith(filename)
    );

    if (resourceIndex === -1) {
      return res.status(404).json({ message: "Resource not found" });
    }

    // ✅ Get full file path and delete it from the uploads folder
    const filePath = path.join(resourceDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // ✅ Remove resource from teacher's resources array
    teacher.resources.splice(resourceIndex, 1);
    await teacher.save();

    res.json({ message: "Resource deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Failed to delete resource", error: err.message });
  }
});



export default router;
