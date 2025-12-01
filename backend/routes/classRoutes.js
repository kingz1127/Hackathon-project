import express from 'express';
import Class from '../models/Class.js';

const router = express.Router();

// ==================== CLASS ROUTES ====================

// -------------------- TEACHER ENDPOINTS --------------------

// Create a new class
router.post('/teacher', async (req, res) => {
  try {
    const { teacherId, className, description, schedule, semester, academicYear, room, maxStudents } = req.body;

    const newClass = new Class({
      teacherId,
      className,
      description,
      schedule,
      semester,
      academicYear,
      room,
      maxStudents,
      enrolledStudents: []
    });

    const savedClass = await newClass.save();
    res.status(201).json(savedClass);
  } catch (err) {
    console.error('Error creating class:', err);
    res.status(500).json({ message: 'Failed to create class', error: err.message });
  }
});

// Get all classes for a teacher
router.get('/teacher/:teacherId', async (req, res) => {
  try {
    const classes = await Class.find({ teacherId: req.params.teacherId });
    res.json(classes);
  } catch (err) {
    console.error('Error fetching teacher classes:', err);
    res.status(500).json({ message: 'Failed to fetch classes', error: err.message });
  }
});

// -------------------- STUDENT ENDPOINTS --------------------

// Get all classes a student is enrolled in (optionally filter by teacher)
router.get('/student/:studentId', async (req, res) => {
  try {
    const { teacherId } = req.query; // optional filter
    const filter = { enrolledStudents: req.params.studentId };
    if (teacherId) filter.teacherId = teacherId;

    const classes = await Class.find(filter);
    res.json(classes);
  } catch (err) {
    console.error('Error fetching student classes:', err);
    res.status(500).json({ message: 'Failed to fetch classes', error: err.message });
  }
});

// Enroll a student in a class
router.post('/:classId/enroll', async (req, res) => {
  try {
    const { studentId } = req.body;

    const classData = await Class.findById(req.params.classId);
    if (!classData) return res.status(404).json({ message: 'Class not found' });

    if (classData.enrolledStudents.includes(studentId)) {
      return res.status(400).json({ message: 'Student already enrolled' });
    }

    if (classData.maxStudents && classData.enrolledStudents.length >= parseInt(classData.maxStudents)) {
  return res.status(400).json({ message: 'Class is full' });
} 

    classData.enrolledStudents.push(studentId);
    await classData.save();

    res.json(classData);
  } catch (err) {
    console.error('Error enrolling student:', err);
    res.status(500).json({ message: 'Failed to enroll student', error: err.message });
  }
});

// Remove a student from a class
router.post('/:classId/unenroll', async (req, res) => {
  try {
    const { studentId } = req.body;

    const classData = await Class.findById(req.params.classId);
    if (!classData) return res.status(404).json({ message: 'Class not found' });

    classData.enrolledStudents = classData.enrolledStudents.filter(id => id.toString() !== studentId);
    await classData.save();

    res.json(classData);
  } catch (err) {
    console.error('Error unenrolling student:', err);
    res.status(500).json({ message: 'Failed to remove student', error: err.message });
  }
});

export default router;
