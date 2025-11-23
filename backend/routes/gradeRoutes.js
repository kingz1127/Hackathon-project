import express from 'express';
import Grade from '../models/Grade.js';

const router = express.Router();

// Get all grades for a student
router.get('/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const grades = await Grade.find({ studentId })
      .populate('assignmentId', 'title totalPoints')
      .populate('classId', 'className')
      .populate('teacherId', 'name email')
      .sort({ createdAt: -1 });
    res.json(grades);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
