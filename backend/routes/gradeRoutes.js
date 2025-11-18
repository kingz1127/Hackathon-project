import express from 'express';
import { authorizeRoles, protect } from '../middleware/authMiddleware.js';
import Class from '../models/Class.js';
import Grade from '../models/Grade.js';
const router = express.Router();


// ==================== TEACHER ROUTES ====================

// @route   POST /api/grades/teacher
// @desc    Add a manual grade (quiz, midterm, participation, etc.)
// @access  Teacher only
router.post('/teacher', protect, authorizeRoles('teacher'), async (req, res) => {
  try {
    const {
      studentId,
      classId,
      gradeType,
      title,
      score,
      maxScore,
      comments
    } = req.body;

    // Verify teacher owns the class
    const classData = await Class.findOne({
      _id: classId,
      teacherId: req.user._id
    });

    if (!classData) {
      return res.status(404).json({ message: 'Class not found or unauthorized' });
    }

    // Verify student is enrolled
    if (!classData.enrolledStudents.includes(studentId)) {
      return res.status(400).json({ message: 'Student not enrolled in this class' });
    }

    const newGrade = new Grade({
      studentId,
      classId,
      teacherId: req.user._id,
      gradeType,
      title,
      score,
      maxScore,
      comments,
      semester: classData.semester,
      academicYear: classData.academicYear
    });

    const savedGrade = await newGrade.save();
    const populatedGrade = await Grade.findById(savedGrade._id)
      .populate('studentId', 'name email studentId')
      .populate('classId', 'className');

    res.status(201).json(populatedGrade);
  } catch (error) {
    console.error('Error creating grade:', error);
    res.status(500).json({ message: 'Failed to create grade', error: error.message });
  }
});

// @route   GET /api/grades/teacher/class/:classId
// @desc    Get all grades for a class (gradebook view)
// @access  Teacher only
router.get('/teacher/class/:classId', protect, authorizeRoles('teacher'), async (req, res) => {
  try {
    // Verify teacher owns the class
    const classData = await Class.findOne({
      _id: req.params.classId,
      teacherId: req.user._id
    }).populate('enrolledStudents', 'name email studentId');

    if (!classData) {
      return res.status(404).json({ message: 'Class not found or unauthorized' });
    }

    // Get all grades for this class
    const grades = await Grade.find({
      classId: req.params.classId
    })
      .populate('studentId', 'name email studentId')
      .populate('assignmentId', 'title')
      .sort({ createdAt: -1 });

    // Organize grades by student
    const gradebook = classData.enrolledStudents.map(student => {
      const studentGrades = grades.filter(
        grade => grade.studentId._id.toString() === student._id.toString()
      );

      // Calculate average
      const totalScore = studentGrades.reduce((sum, grade) => sum + grade.score, 0);
      const totalMaxScore = studentGrades.reduce((sum, grade) => sum + grade.maxScore, 0);
      const average = totalMaxScore > 0 ? ((totalScore / totalMaxScore) * 100).toFixed(2) : 0;

      return {
        student: {
          _id: student._id,
          name: student.name,
          email: student.email,
          studentId: student.studentId
        },
        grades: studentGrades,
        average,
        totalScore,
        totalMaxScore
      };
    });

    res.json({
      class: {
        _id: classData._id,
        className: classData.className,
        semester: classData.semester,
        academicYear: classData.academicYear
      },
      gradebook
    });
  } catch (error) {
    console.error('Error fetching gradebook:', error);
    res.status(500).json({ message: 'Failed to fetch gradebook', error: error.message });
  }
});

// @route   GET /api/grades/teacher/student/:studentId/class/:classId
// @desc    Get all grades for a specific student in a class
// @access  Teacher only
router.get('/teacher/student/:studentId/class/:classId', protect, authorizeRoles('teacher'), async (req, res) => {
  try {
    // Verify teacher owns the class
    const classData = await Class.findOne({
      _id: req.params.classId,
      teacherId: req.user._id
    });

    if (!classData) {
      return res.status(404).json({ message: 'Class not found or unauthorized' });
    }

    const grades = await Grade.find({
      studentId: req.params.studentId,
      classId: req.params.classId
    })
      .populate('assignmentId', 'title')
      .sort({ createdAt: -1 });

    res.json(grades);
  } catch (error) {
    console.error('Error fetching student grades:', error);
    res.status(500).json({ message: 'Failed to fetch grades', error: error.message });
  }
});

// @route   PUT /api/grades/teacher/:id
// @desc    Update a grade
// @access  Teacher only
router.put('/teacher/:id', protect, authorizeRoles('teacher'), async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id);

    if (!grade) {
      return res.status(404).json({ message: 'Grade not found' });
    }

    // Verify teacher owns the class
    const classData = await Class.findOne({
      _id: grade.classId,
      teacherId: req.user._id
    });

    if (!classData) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const { score, maxScore, comments, title, gradeType } = req.body;

    if (score !== undefined) grade.score = score;
    if (maxScore !== undefined) grade.maxScore = maxScore;
    if (comments !== undefined) grade.comments = comments;
    if (title) grade.title = title;
    if (gradeType) grade.gradeType = gradeType;

    const updatedGrade = await grade.save();
    const populatedGrade = await Grade.findById(updatedGrade._id)
      .populate('studentId', 'name email')
      .populate('classId', 'className');

    res.json(populatedGrade);
  } catch (error) {
    console.error('Error updating grade:', error);
    res.status(500).json({ message: 'Failed to update grade', error: error.message });
  }
});

// @route   DELETE /api/grades/teacher/:id
// @desc    Delete a grade
// @access  Teacher only
router.delete('/teacher/:id', protect, authorizeRoles('teacher'), async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id);

    if (!grade) {
      return res.status(404).json({ message: 'Grade not found' });
    }

    // Verify teacher owns the class
    const classData = await Class.findOne({
      _id: grade.classId,
      teacherId: req.user._id
    });

    if (!classData) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await Grade.findByIdAndDelete(req.params.id);

    res.json({ message: 'Grade deleted successfully', gradeId: req.params.id });
  } catch (error) {
    console.error('Error deleting grade:', error);
    res.status(500).json({ message: 'Failed to delete grade', error: error.message });
  }
});

// ==================== STUDENT ROUTES ====================

// @route   GET /api/grades/student
// @desc    Get all grades for logged-in student
// @access  Student only
router.get('/student', protect, authorizeRoles('student'), async (req, res) => {
  try {
    const { classId } = req.query;

    const filter = { studentId: req.user._id };
    if (classId) filter.classId = classId;

    const grades = await Grade.find(filter)
      .populate('classId', 'className')
      .populate('assignmentId', 'title')
      .populate('teacherId', 'name')
      .sort({ createdAt: -1 });

    res.json(grades);
  } catch (error) {
    console.error('Error fetching grades:', error);
    res.status(500).json({ message: 'Failed to fetch grades', error: error.message });
  }
});

// @route   GET /api/grades/student/class/:classId
// @desc    Get all grades for student in a specific class
// @access  Student only
router.get('/student/class/:classId', protect, authorizeRoles('student'), async (req, res) => {
  try {
    // Verify student is enrolled
    const classData = await Class.findOne({
      _id: req.params.classId,
      enrolledStudents: req.user._id
    });

    if (!classData) {
      return res.status(404).json({ message: 'Class not found or not enrolled' });
    }

    const grades = await Grade.find({
      studentId: req.user._id,
      classId: req.params.classId
    })
      .populate('assignmentId', 'title')
      .sort({ createdAt: -1 });

    // Calculate average for this class
    const totalScore = grades.reduce((sum, grade) => sum + grade.score, 0);
    const totalMaxScore = grades.reduce((sum, grade) => sum + grade.maxScore, 0);
    const average = totalMaxScore > 0 ? ((totalScore / totalMaxScore) * 100).toFixed(2) : 0;

    res.json({
      class: {
        _id: classData._id,
        className: classData.className,
        semester: classData.semester,
        academicYear: classData.academicYear
      },
      grades,
      average,
      totalScore,
      totalMaxScore
    });
  } catch (error) {
    console.error('Error fetching class grades:', error);
    res.status(500).json({ message: 'Failed to fetch grades', error: error.message });
  }
});

// @route   GET /api/grades/student/report
// @desc    Get comprehensive grade report for student
// @access  Student only
router.get('/student/report', protect, authorizeRoles('student'), async (req, res) => {
  try {
    // Get all classes student is enrolled in
    const classes = await Class.find({
      enrolledStudents: req.user._id,
      status: 'active'
    }).select('_id className semester academicYear');

    // Get grades for each class
    const report = await Promise.all(
      classes.map(async (classData) => {
        const grades = await Grade.find({
          studentId: req.user._id,
          classId: classData._id
        }).populate('assignmentId', 'title');

        const totalScore = grades.reduce((sum, grade) => sum + grade.score, 0);
        const totalMaxScore = grades.reduce((sum, grade) => sum + grade.maxScore, 0);
        const average = totalMaxScore > 0 ? ((totalScore / totalMaxScore) * 100).toFixed(2) : 0;

        return {
          class: classData,
          grades,
          average,
          totalScore,
          totalMaxScore
        };
      })
    );

    // Calculate overall GPA
    const overallAverage = report.length > 0
      ? (report.reduce((sum, r) => sum + parseFloat(r.average), 0) / report.length).toFixed(2)
      : 0;

    res.json({
      report,
      overallAverage,
      totalClasses: classes.length
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ message: 'Failed to generate report', error: error.message });
  }
});
export default router;
