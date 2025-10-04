// routes/router.js
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import express from "express";
import multer from "multer";
import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";

import Admin from "../models/Admin.js";
import Attendance from "../models/Attendance.js";
import Message from "../models/Message.js";
import Student from "../models/Student.js";
import Teacher from "../models/Teacher.js";

dotenv.config();

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------- Teacher Routes ----------
router.get("/teachers", async (req, res) => {
  try {
    const teachers = await Teacher.find();
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch teachers" });
  }
});

router.get("/teachers/:id", async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) return res.status(404).json({ error: "Teacher not found" });
    res.json(teacher);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch teacher" });
  }
});

router.post("/teachers", async (req, res) => {
  try {
    const newTeacher = new Teacher(req.body);
    const savedTeacher = await newTeacher.save();
    res.status(201).json(savedTeacher);
  } catch (err) {
    res.status(400).json({ error: "Failed to create teacher", details: err.message });
  }
});

router.put("/teachers/:id", async (req, res) => {
  try {
    const updatedTeacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedTeacher) return res.status(404).json({ error: "Teacher not found" });
    res.json(updatedTeacher);
  } catch (err) {
    res.status(400).json({ error: "Failed to update teacher", details: err.message });
  }
});

router.delete("/teachers/:id", async (req, res) => {
  try {
    const deletedTeacher = await Teacher.findByIdAndDelete(req.params.id);
    if (!deletedTeacher) return res.status(404).json({ error: "Teacher not found" });
    res.json({ message: "Teacher deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete teacher" });
  }
});

// ---------- Attendance Routes ----------
router.get("/attendance", async (req, res) => {
  try {
    const attendance = await Attendance.find().populate("student");
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch attendance" });
  }
});

router.post("/attendance", async (req, res) => {
  try {
    const newAttendance = new Attendance(req.body);
    const savedAttendance = await newAttendance.save();
    res.status(201).json(savedAttendance);
  } catch (err) {
    res.status(400).json({ error: "Failed to mark attendance", details: err.message });
  }
});

// ---------- Message Routes ----------
router.get("/messages", async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

router.post("/messages", async (req, res) => {
  try {
    const newMessage = new Message(req.body);
    const savedMessage = await newMessage.save();
    res.status(201).json(savedMessage);
  } catch (err) {
    res.status(400).json({ error: "Failed to send message", details: err.message });
  }
});

// Export main router
export default router;
