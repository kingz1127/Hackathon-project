import express from 'express';
import Assignment from '../models/Assignment.js';
import Class from '../models/Class.js';

const router = express.Router();

// ==================== TEACHER ROUTES ====================

// Create an assignment
// POST /api/assignments
// Body must include: teacherId, classId, title, description, dueDate, totalPoints
router.post('/', async (req, res) => {
  try {
    const { teacherId, classId, title, description, instructions, dueDate, totalPoints, attachments } = req.body;

    // Verify class exists and teacher owns it
    const classData = await Class.findById(classId);
    if (!classData) return res.status(404).json({ message: 'Class not found' });
    if (String(classData.teacherId) !== teacherId) return res.status(403).json({ message: 'Unauthorized' });

    const newAssignment = await Assignment.create({
      classId,
      teacherId,
      title,
      description,
      instructions,
      dueDate,
      totalPoints,
      attachments
    });

    res.status(201).json(newAssignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all assignments for a class (teacher)
router.get('/teacher/class/:classId', async (req, res) => {
  try {
    const { classId } = req.params;
    const { teacherId } = req.query; // pass teacherId in query

    const classData = await Class.findById(classId);
    if (!classData) return res.status(404).json({ message: 'Class not found' });
    if (String(classData.teacherId) !== teacherId) return res.status(403).json({ message: 'Unauthorized' });

    const assignments = await Assignment.find({ classId });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== STUDENT ROUTES ====================

// Get assignments for a student by classId
// GET /api/assignments/student/:studentId?classId=
router.get('/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { classId } = req.query;

    if (!classId) return res.status(400).json({ message: 'classId is required' });

    // Verify student is enrolled in class
    const classData = await Class.findOne({ _id: classId, enrolledStudents: studentId });
    if (!classData) return res.status(403).json({ message: 'Not enrolled in this class' });

    const assignments = await Assignment.find({ classId });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
