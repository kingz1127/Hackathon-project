import express from "express";
import Attendance from "./models/Attendance.js";

const router = express.Router();

// Get all attendance
router.get("/", async (req, res) => {
  try {
    const allAttendance = await Attendance.find({});
    res.json(allAttendance);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get attendance by student
router.get("/student/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    console.log("Fetching attendance for studentId:", studentId);

    const records = await Attendance.find({ studentId });
    console.log("Attendance records found:", records.length);

    res.json(records);
  } catch (err) {
    console.error("Error in /attendance/student/:studentId:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Save attendance
router.post("/student/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    const { classId, teacherId, date, status, note } = req.body;

    const existing = await Attendance.findOne({ studentId, classId, date });
    if (existing) {
      return res.status(400).json({ message: "Attendance already recorded" });
    }

    const attendance = new Attendance({
      studentId,
      classId,
      teacherId,
      date,
      status,
      note,
    });

    await attendance.save();
    res.status(201).json({ message: "Attendance saved", attendance });
  } catch (err) {
    console.error("Error saving attendance:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
