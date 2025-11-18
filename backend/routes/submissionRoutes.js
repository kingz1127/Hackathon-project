import express from 'express';
import { authorizeRoles, protect } from '../middleware/authMiddleware.js';
import Assignment from '../models/Assignment.js';
import Class from '../models/Class.js';
import Grade from '../models/Grade.js';
import Submission from '../models/Submission.js';
const router = express.Router();

// ==================== TEACHER ROUTES ====================

// @route   GET /api/submissions/teacher/assignment/:assignmentId
// @desc    Get all submissions for an assignment
// @access  Teacher only
router.get('/teacher/assignment/:assignmentId', protect, authorizeRoles('teacher'), async (req, res) => {
  try {
    // Verify teacher owns the assignment
    const assignment = await Assignment.findOne({
      _id: req.params.assignmentId,
      teacherId: req.user._id
    });

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found or unauthorized' });
    }

    const submissions = await Submission.find({
      assignmentId: req.params.assignmentId
    })
      .populate('studentId', 'name email studentId')
      .populate('assignmentId', 'title totalPoints dueDate')
      .sort({ submittedAt: -1 });

    res.json(submissions);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ message: 'Failed to fetch submissions', error: error.message });
  }
});

// @route   GET /api/submissions/teacher/:id
// @desc    Get single submission details
// @access  Teacher only
router.get('/teacher/:id', protect, authorizeRoles('teacher'), async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('studentId', 'name email studentId')
      .populate('assignmentId', 'title totalPoints dueDate description')
      .populate('classId', 'className');

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Verify teacher owns the class
    const classData = await Class.findOne({
      _id: submission.classId,
      teacherId: req.user._id
    });

    if (!classData) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.json(submission);
  } catch (error) {
    console.error('Error fetching submission:', error);
    res.status(500).json({ message: 'Failed to fetch submission', error: error.message });
  }
});

// @route   PUT /api/submissions/teacher/:id/grade
// @desc    Grade a submission
// @access  Teacher only
router.put('/teacher/:id/grade', protect, authorizeRoles('teacher'), async (req, res) => {
  try {
    const { grade, feedback } = req.body;

    const submission = await Submission.findById(req.params.id)
      .populate('assignmentId', 'totalPoints classId title')
      .populate('studentId', 'name email');

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Verify teacher owns the class
    const classData = await Class.findOne({
      _id: submission.classId,
      teacherId: req.user._id
    });

    if (!classData) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Update submission
    submission.grade = grade;
    submission.maxGrade = submission.assignmentId.totalPoints;
    submission.feedback = feedback;
    submission.status = 'graded';
    submission.gradedAt = new Date();
    submission.gradedBy = req.user._id;

    const updatedSubmission = await submission.save();

    // Create or update grade record
    const existingGrade = await Grade.findOne({
      studentId: submission.studentId,
      classId: submission.classId,
      assignmentId: submission.assignmentId
    });

    if (existingGrade) {
      existingGrade.score = grade;
      existingGrade.maxScore = submission.assignmentId.totalPoints;
      existingGrade.comments = feedback;
      await existingGrade.save();
    } else {
      const newGrade = new Grade({
        studentId: submission.studentId,
        classId: submission.classId,
        teacherId: req.user._id,
        assignmentId: submission.assignmentId,
        gradeType: 'assignment',
        title: submission.assignmentId.title,
        score: grade,
        maxScore: submission.assignmentId.totalPoints,
        comments: feedback,
        semester: classData.semester,
        academicYear: classData.academicYear
      });
      await newGrade.save();
    }

    const populatedSubmission = await Submission.findById(updatedSubmission._id)
      .populate('studentId', 'name email')
      .populate('assignmentId', 'title totalPoints');

    res.json(populatedSubmission);
  } catch (error) {
    console.error('Error grading submission:', error);
    res.status(500).json({ message: 'Failed to grade submission', error: error.message });
  }
});

// ==================== STUDENT ROUTES ====================

// @route   POST /api/submissions/student
// @desc    Submit an assignment
// @access  Student only
router.post('/student', protect, authorizeRoles('student'), async (req, res) => {
  try {
    const { assignmentId, content, attachments } = req.body;

    // Get assignment and verify it exists
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Verify student is enrolled in the class
    const classData = await Class.findOne({
      _id: assignment.classId,
      enrolledStudents: req.user._id
    });

    if (!classData) {
      return res.status(403).json({ message: 'Not enrolled in this class' });
    }

    // Check if already submitted
    const existingSubmission = await Submission.findOne({
      assignmentId,
      studentId: req.user._id
    });

    if (existingSubmission) {
      return res.status(400).json({ message: 'Assignment already submitted. Use update endpoint to modify.' });
    }

    // Determine if submission is late
    const isLate = new Date() > assignment.dueDate;
    const status = isLate ? 'late' : 'submitted';

    const newSubmission = new Submission({
      assignmentId,
      studentId: req.user._id,
      classId: assignment.classId,
      content,
      attachments,
      status,
      submittedAt: new Date()
    });

    const savedSubmission = await newSubmission.save();
    const populatedSubmission = await Submission.findById(savedSubmission._id)
      .populate('assignmentId', 'title dueDate totalPoints')
      .populate('classId', 'className');

    res.status(201).json(populatedSubmission);
  } catch (error) {
    console.error('Error submitting assignment:', error);
    res.status(500).json({ message: 'Failed to submit assignment', error: error.message });
  }
});

// @route   GET /api/submissions/student
// @desc    Get all submissions for logged-in student
// @access  Student only
router.get('/student', protect, authorizeRoles('student'), async (req, res) => {
  try {
    const { classId, status } = req.query;

    const filter = { studentId: req.user._id };
    if (classId) filter.classId = classId;
    if (status) filter.status = status;

    const submissions = await Submission.find(filter)
      .populate('assignmentId', 'title dueDate totalPoints')
      .populate('classId', 'className')
      .sort({ submittedAt: -1 });

    res.json(submissions);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ message: 'Failed to fetch submissions', error: error.message });
  }
});

// @route   GET /api/submissions/student/:id
// @desc    Get single submission details
// @access  Student only
router.get('/student/:id', protect, authorizeRoles('student'), async (req, res) => {
  try {
    const submission = await Submission.findOne({
      _id: req.params.id,
      studentId: req.user._id
    })
      .populate('assignmentId', 'title dueDate totalPoints description instructions')
      .populate('classId', 'className')
      .populate('gradedBy', 'name');

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    res.json(submission);
  } catch (error) {
    console.error('Error fetching submission:', error);
    res.status(500).json({ message: 'Failed to fetch submission', error: error.message });
  }
});

// @route   PUT /api/submissions/student/:id
// @desc    Update submission (before grading only)
// @access  Student only
router.put('/student/:id', protect, authorizeRoles('student'), async (req, res) => {
  try {
    const submission = await Submission.findOne({
      _id: req.params.id,
      studentId: req.user._id
    }).populate('assignmentId', 'dueDate');

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    if (submission.status === 'graded') {
      return res.status(400).json({ message: 'Cannot update graded submission' });
    }

    const { content, attachments } = req.body;

    if (content !== undefined) submission.content = content;
    if (attachments) submission.attachments = attachments;

    // Check if now late
    const isLate = new Date() > submission.assignmentId.dueDate;
    if (isLate && submission.status !== 'late') {
      submission.status = 'late';
    }

    submission.submittedAt = new Date();

    const updatedSubmission = await submission.save();
    const populatedSubmission = await Submission.findById(updatedSubmission._id)
      .populate('assignmentId', 'title dueDate totalPoints')
      .populate('classId', 'className');

    res.json(populatedSubmission);
  } catch (error) {
    console.error('Error updating submission:', error);
    res.status(500).json({ message: 'Failed to update submission', error: error.message });
  }
});

export default router;
