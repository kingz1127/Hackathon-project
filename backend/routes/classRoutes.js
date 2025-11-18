import express from 'express';
import { authorizeRoles, protect } from '../middleware/authMiddleware.js';
import Class from '../models/Class.js';
const router = express.Router();

// ==================== TEACHER ROUTES ====================

// @route   POST /api/classes/teacher
// @desc    Create a new class
// @access  Teacher only
router.post('/teacher', protect, authorizeRoles('teacher'), async (req, res) => {
  try {
    const {
      courseId,
      className,
      description,
      schedule,
      semester,
      academicYear,
      room,
      maxStudents
    } = req.body;

    const newClass = new Class({
      courseId,
      teacherId: req.user._id,
      className,
      description,
      schedule,
      semester,
      academicYear,
      room,
      maxStudents
    });

    const savedClass = await newClass.save();
    const populatedClass = await Class.findById(savedClass._id)
      .populate('courseId', 'name code')
      .populate('teacherId', 'name email');

    res.status(201).json(populatedClass);
  } catch (error) {
    console.error('Error creating class:', error);
    res.status(500).json({ message: 'Failed to create class', error: error.message });
  }
});

// @route   GET /api/classes/teacher
// @desc    Get all classes for logged-in teacher
// @access  Teacher only
router.get('/teacher', protect, authorizeRoles('teacher'), async (req, res) => {
  try {
    const { status, semester } = req.query;
    
    const filter = { teacherId: req.user._id };
    if (status) filter.status = status;
    if (semester) filter.semester = semester;

    const classes = await Class.find(filter)
      .populate('courseId', 'name code')
      .populate('enrolledStudents', 'name email')
      .sort({ createdAt: -1 });

    res.json(classes);
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ message: 'Failed to fetch classes', error: error.message });
  }
});

// @route   GET /api/classes/teacher/:id
// @desc    Get single class details for teacher
// @access  Teacher only
router.get('/teacher/:id', protect, authorizeRoles('teacher'), async (req, res) => {
  try {
    const classData = await Class.findOne({
      _id: req.params.id,
      teacherId: req.user._id
    })
      .populate('courseId', 'name code description')
      .populate('enrolledStudents', 'name email studentId')
      .populate('teacherId', 'name email');

    if (!classData) {
      return res.status(404).json({ message: 'Class not found or unauthorized' });
    }

    res.json(classData);
  } catch (error) {
    console.error('Error fetching class:', error);
    res.status(500).json({ message: 'Failed to fetch class', error: error.message });
  }
});

// @route   PUT /api/classes/teacher/:id
// @desc    Update a class
// @access  Teacher only
router.put('/teacher/:id', protect, authorizeRoles('teacher'), async (req, res) => {
  try {
    const classData = await Class.findOne({
      _id: req.params.id,
      teacherId: req.user._id
    });

    if (!classData) {
      return res.status(404).json({ message: 'Class not found or unauthorized' });
    }

    const {
      className,
      description,
      schedule,
      semester,
      academicYear,
      room,
      maxStudents,
      status
    } = req.body;

    if (className) classData.className = className;
    if (description !== undefined) classData.description = description;
    if (schedule) classData.schedule = schedule;
    if (semester) classData.semester = semester;
    if (academicYear) classData.academicYear = academicYear;
    if (room !== undefined) classData.room = room;
    if (maxStudents) classData.maxStudents = maxStudents;
    if (status) classData.status = status;

    const updatedClass = await classData.save();
    const populatedClass = await Class.findById(updatedClass._id)
      .populate('courseId', 'name code')
      .populate('enrolledStudents', 'name email');

    res.json(populatedClass);
  } catch (error) {
    console.error('Error updating class:', error);
    res.status(500).json({ message: 'Failed to update class', error: error.message });
  }
});

// @route   DELETE /api/classes/teacher/:id
// @desc    Delete a class
// @access  Teacher only
router.delete('/teacher/:id', protect, authorizeRoles('teacher'), async (req, res) => {
  try {
    const classData = await Class.findOneAndDelete({
      _id: req.params.id,
      teacherId: req.user._id
    });

    if (!classData) {
      return res.status(404).json({ message: 'Class not found or unauthorized' });
    }

    res.json({ message: 'Class deleted successfully', classId: req.params.id });
  } catch (error) {
    console.error('Error deleting class:', error);
    res.status(500).json({ message: 'Failed to delete class', error: error.message });
  }
});

// @route   POST /api/classes/teacher/:id/enroll
// @desc    Enroll a student in class
// @access  Teacher only
router.post('/teacher/:id/enroll', protect, authorizeRoles('teacher'), async (req, res) => {
  try {
    const { studentId } = req.body;

    const classData = await Class.findOne({
      _id: req.params.id,
      teacherId: req.user._id
    });

    if (!classData) {
      return res.status(404).json({ message: 'Class not found or unauthorized' });
    }

    if (classData.enrolledStudents.includes(studentId)) {
      return res.status(400).json({ message: 'Student already enrolled' });
    }

    if (classData.enrolledStudents.length >= classData.maxStudents) {
      return res.status(400).json({ message: 'Class is full' });
    }

    classData.enrolledStudents.push(studentId);
    await classData.save();

    const updatedClass = await Class.findById(classData._id)
      .populate('enrolledStudents', 'name email');

    res.json(updatedClass);
  } catch (error) {
    console.error('Error enrolling student:', error);
    res.status(500).json({ message: 'Failed to enroll student', error: error.message });
  }
});

// @route   DELETE /api/classes/teacher/:id/unenroll/:studentId
// @desc    Remove a student from class
// @access  Teacher only
router.delete('/teacher/:id/unenroll/:studentId', protect, authorizeRoles('teacher'), async (req, res) => {
  try {
    const classData = await Class.findOne({
      _id: req.params.id,
      teacherId: req.user._id
    });

    if (!classData) {
      return res.status(404).json({ message: 'Class not found or unauthorized' });
    }

    classData.enrolledStudents = classData.enrolledStudents.filter(
      id => id.toString() !== req.params.studentId
    );
    
    await classData.save();

    const updatedClass = await Class.findById(classData._id)
      .populate('enrolledStudents', 'name email');

    res.json(updatedClass);
  } catch (error) {
    console.error('Error removing student:', error);
    res.status(500).json({ message: 'Failed to remove student', error: error.message });
  }
});

// ==================== STUDENT ROUTES ====================

// @route   GET /api/classes/student
// @desc    Get all enrolled classes for logged-in student
// @access  Student only
router.get('/student', protect, authorizeRoles('student'), async (req, res) => {
  try {
    const classes = await Class.find({
      enrolledStudents: req.user._id,
      status: 'active'
    })
      .populate('courseId', 'name code')
      .populate('teacherId', 'name email')
      .sort({ 'schedule.day': 1 });

    res.json(classes);
  } catch (error) {
    console.error('Error fetching student classes:', error);
    res.status(500).json({ message: 'Failed to fetch classes', error: error.message });
  }
});

// @route   GET /api/classes/student/:id
// @desc    Get single class details for student
// @access  Student only
router.get('/student/:id', protect, authorizeRoles('student'), async (req, res) => {
  try {
    const classData = await Class.findOne({
      _id: req.params.id,
      enrolledStudents: req.user._id
    })
      .populate('courseId', 'name code description')
      .populate('teacherId', 'name email');

    if (!classData) {
      return res.status(404).json({ message: 'Class not found or not enrolled' });
    }

    res.json(classData);
  } catch (error) {
    console.error('Error fetching class:', error);
    res.status(500).json({ message: 'Failed to fetch class', error: error.message });
  }
});

export default router;
