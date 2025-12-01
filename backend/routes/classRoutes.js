import express from "express";
import Class from "../models/Class.js";
import Student from "../models/Student.js";

const router = express.Router();

// ==================== CLASS ROUTES ====================
// CLEAN, SIMPLE, NO ENROLL FEATURE, NO COURSE FIELD

// ---------------------- TEACHER ENDPOINTS ----------------------

// CREATE a new class
router.post("/teacher", async (req, res) => {
  try {
    const {
      teacherId,
      className,
      description,
      schedule,
      semester,
      academicYear,
      room,
      maxStudents,
    } = req.body;

    const newClass = new Class({
      teacherId,
      className,
      description,
      schedule,
      semester,
      academicYear,
      room,
      maxStudents,
    });

    const savedClass = await newClass.save();
    res.status(201).json(savedClass);
  } catch (err) {
    console.error("Error creating class:", err);
    res.status(500).json({
      message: "Failed to create class",
      error: err.message,
    });
  }
});

// GET ALL classes for a teacher
router.get("/teacher/:teacherId", async (req, res) => {
  try {
    const classes = await Class.find({ teacherId: req.params.teacherId });
    res.json(classes);
  } catch (err) {
    console.error("Error fetching teacher classes:", err);
    res.status(500).json({
      message: "Failed to fetch classes",
      error: err.message,
    });
  }
});

// UPDATE a class
router.put("/teacher/:classId", async (req, res) => {
  try {
    const updatedClass = await Class.findByIdAndUpdate(
      req.params.classId,
      req.body,
      { new: true }
    );
    res.json(updatedClass);
  } catch (err) {
    console.error("Error updating class:", err);
    res.status(500).json({
      message: "Failed to update class",
      error: err.message,
    });
  }
});

// DELETE a class
router.delete("/teacher/:classId", async (req, res) => {
  try {
    await Class.findByIdAndDelete(req.params.classId);
    res.json({ message: "Class deleted successfully" });
  } catch (err) {
    console.error("Error deleting class:", err);
    res.status(500).json({
      message: "Failed to delete class",
      error: err.message,
    });
  }
});

// ---------------------- STUDENT ENDPOINTS ----------------------

// FETCH classes for a student based on their teacher
router.get("/student/:studentId", async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);
    if (!student)
      return res.status(404).json({ message: "Student not found" });

    // Return all classes for the student's teacher
    const classes = await Class.find({ teacherId: student.teacherId });

    res.json(classes);
  } catch (err) {
    console.error("Error fetching student classes:", err);
    res.status(500).json({
      message: "Failed to fetch classes",
      error: err.message,
    });
  }
});

export default router;
