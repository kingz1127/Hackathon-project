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

// Get attendance by student (optional date filter)
router.get("/student/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    const { date } = req.query; // optional date filter
    console.log("Fetching attendance for studentId:", studentId, "date:", date);

    let records;
    if (date) {
      records = await Attendance.findOne({ studentId, date });
      console.log("Attendance record found for date:", records ? 1 : 0);
    } else {
      records = await Attendance.find({ studentId });
      console.log("Attendance records found:", records.length);
    }

    res.json(records);
  } catch (err) {
    console.error("Error in /attendance/student/:studentId:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ New route: Get all attendance for a student (map by date)
router.get("/student/:studentId/all", async (req, res) => {
  try {
    const { studentId } = req.params;
    const records = await Attendance.find({ studentId }).sort({ date: 1 });

    const attendanceMap = {};
    records.forEach(r => {
      attendanceMap[r.date] = { status: r.status, note: r.note };
    });

    res.json(attendanceMap); // Example: { "2025-09-20": {status:"Present", note:"..."}, ... }
  } catch (err) {
    console.error("Error in /attendance/student/:studentId/all:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Save or update attendance
router.post("/student/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    const { classId, teacherId, date, status, note } = req.body;

    let attendance = await Attendance.findOne({ studentId, classId, date });

    if (attendance) {
      // Update existing record
      attendance.status = status;
      attendance.note = note;
      await attendance.save();
      return res.status(200).json({ message: "Attendance updated", attendance });
    }

    // Create new record
    attendance = new Attendance({
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
    console.error("Error saving/updating attendance:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
