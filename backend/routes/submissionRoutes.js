import express from 'express';
import Assignment from '../models/Assignment.js';
import Class from '../models/Class.js';
import Grade from '../models/Grade.js';
import Submission from '../models/Submission.js';

const router = express.Router();

// ==================== STUDENT ROUTES ====================

// Submit an assignment
// POST /api/submissions
router.post('/', async (req, res) => {
  try {
    const { studentId, assignmentId, content, attachments } = req.body;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    const classData = await Class.findOne({ _id: assignment.classId, enrolledStudents: studentId });
    if (!classData) return res.status(403).json({ message: 'Not enrolled in this class' });

    // Check if already submitted
    const existing = await Submission.findOne({ assignmentId, studentId });
    if (existing) return res.status(400).json({ message: 'Already submitted' });

    const status = new Date() > assignment.dueDate ? 'late' : 'submitted';

    const submission = await Submission.create({
      assignmentId,
      classId: assignment.classId,
      studentId,
      content,
      attachments,
      status
    });

    res.status(201).json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all submissions by student
// GET /api/submissions/student/:studentId?classId=
router.get('/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { classId } = req.query;

    const filter = { studentId };
    if (classId) filter.classId = classId;

    const submissions = await Submission.find(filter).sort({ submittedAt: -1 });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== TEACHER ROUTES ====================

// Get all submissions for an assignment
// GET /api/submissions/teacher/:assignmentId?teacherId=
router.get('/teacher/:assignmentId', async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { teacherId } = req.query;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    if (String(assignment.teacherId) !== teacherId) return res.status(403).json({ message: 'Unauthorized' });

    const submissions = await Submission.find({ assignmentId }).sort({ submittedAt: -1 });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Grade a submission
// PUT /api/submissions/:submissionId/grade
router.put('/:submissionId/grade', async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { teacherId, grade, feedback } = req.body;

    const submission = await Submission.findById(submissionId);
    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    const classData = await Class.findById(submission.classId);
    if (!classData) return res.status(403).json({ message: 'Unauthorized' });
    if (String(classData.teacherId) !== teacherId) return res.status(403).json({ message: 'Unauthorized' });

    submission.grade = grade;
    submission.feedback = feedback;
    submission.status = 'graded';
    submission.gradedAt = new Date();
    submission.gradedBy = teacherId;

    await submission.save();

    // Update or create Grade record
    let gradeRecord = await Grade.findOne({
      studentId: submission.studentId,
      assignmentId: submission.assignmentId,
      classId: submission.classId
    });

    if (gradeRecord) {
      gradeRecord.score = grade;
      gradeRecord.comments = feedback;
      await gradeRecord.save();
    } else {
      await Grade.create({
        studentId: submission.studentId,
        assignmentId: submission.assignmentId,
        classId: submission.classId,
        teacherId,
        gradeType: 'assignment',
        title: submission.assignmentId.title,
        score: grade,
        maxScore: submission.assignmentId.totalPoints
      });
    }

    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
