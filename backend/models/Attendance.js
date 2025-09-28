// models/Attendance.js
import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  studentId: {
    type: String,       // store student ID as string
    required: true
  },
  classId: {
    type: String,       // store class identifier as string
    required: true
  },
  teacherId: {
    type: String,       // store teacher ID as string
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ["present", "absent", "leave"],
    required: true
  },
  note: {
    type: String,
    default: ""
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Attendance", attendanceSchema);
