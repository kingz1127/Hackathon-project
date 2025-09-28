import express from "express"; 
import Attendance from "./models/Attendance.js";

const router = express.Router();

// Get all attendance
router.get("/", async (req, res) => {
  try {
    const allAttendance = await Attendance.find({})
      .populate('teacherId', 'fullName name teacherId') // ✅ Populate teacher info
      .sort({ date: -1 });
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
      records = await Attendance.findOne({ studentId, date })
        .populate('teacherId', 'fullName name teacherId'); // ✅ Populate teacher info
      console.log("Attendance record found for date:", records ? 1 : 0);
    } else {
      records = await Attendance.find({ studentId })
        .populate('teacherId', 'fullName name teacherId') // ✅ Populate teacher info
        .sort({ date: -1 });
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
    const records = await Attendance.find({ studentId })
      .populate('teacherId', 'fullName name teacherId') // ✅ Populate teacher info
      .sort({ date: 1 });

    const attendanceMap = {};
    records.forEach(r => {
      attendanceMap[r.date] = { 
        status: r.status, 
        note: r.note,
        teacherName: r.teacherId?.fullName || r.teacherId?.name || 'Unknown Teacher' // ✅ Include teacher name
      };
    });

    res.json(attendanceMap); // Example: { "2025-09-20": {status:"Present", note:"...", teacherName: "John Doe"}, ... }
  } catch (err) {
    console.error("Error in /attendance/student/:studentId/all:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ New route: Get attendance with teacher details for student dashboard
router.get("/student/:studentId/detailed", async (req, res) => {
  try {
    const { studentId } = req.params;
    const records = await Attendance.find({ studentId })
      .populate('teacherId', 'fullName name teacherId email') // ✅ Populate full teacher info
      .sort({ date: -1 });

    // Transform records to include teacher name directly
    const detailedRecords = records.map(record => ({
      ...record.toObject(),
      teacherName: record.teacherId?.fullName || record.teacherId?.name || 'Unknown Teacher',
      teacherEmail: record.teacherId?.email || null
    }));

    res.json(detailedRecords);
  } catch (err) {
    console.error("Error in /attendance/student/:studentId/detailed:", err);
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
      attendance.teacherId = teacherId; // ✅ Ensure teacherId is updated
      await attendance.save();
      
      // ✅ Populate teacher info before returning
      await attendance.populate('teacherId', 'fullName name teacherId');
      
      return res.status(200).json({ 
        message: "Attendance updated", 
        attendance: {
          ...attendance.toObject(),
          teacherName: attendance.teacherId?.fullName || attendance.teacherId?.name || 'Unknown Teacher'
        }
      });
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
    
    // ✅ Populate teacher info before returning
    await attendance.populate('teacherId', 'fullName name teacherId');
    
    res.status(201).json({ 
      message: "Attendance saved", 
      attendance: {
        ...attendance.toObject(),
        teacherName: attendance.teacherId?.fullName || attendance.teacherId?.name || 'Unknown Teacher'
      }
    });
  } catch (err) {
    console.error("Error saving/updating attendance:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;