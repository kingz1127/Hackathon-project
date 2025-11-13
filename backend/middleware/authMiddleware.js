import jwt from 'jsonwebtoken';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';

// Protect routes - verify JWT token
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

      // The token can contain either teacher or student info
      // Based on your login system, it returns either:
      // - { teacherId, email, fullName, course, role: "teacher" }
      // - { studentId, email, fullName, course, role: "student" }

      if (decoded.role === 'teacher' || decoded.teacherId) {
        // Fetch teacher from database
        const teacher = await Teacher.findOne({ 
          teacherId: decoded.teacherId || decoded.id 
        }).select('-password');

        if (!teacher || !teacher.isActive) {
          return res.status(401).json({ message: 'Teacher not found or inactive' });
        }

        // Attach teacher info to request
        req.user = {
          _id: teacher._id,
          id: teacher.teacherId,
          teacherId: teacher.teacherId,
          email: teacher.email,
          name: teacher.fullName,
          fullName: teacher.fullName,
          role: 'teacher',
          course: teacher.course,
          nation: teacher.nation
        };

      } else if (decoded.role === 'student' || decoded.studentId) {
        // Fetch student from database
        const student = await Student.findOne({ 
          studentId: decoded.studentId || decoded.id 
        }).select('-password');

        if (!student || !student.isActive) {
          return res.status(401).json({ message: 'Student not found or inactive' });
        }

        // Attach student info to request
        req.user = {
          _id: student._id,
          id: student.studentId,
          studentId: student.studentId,
          email: student.email,
          name: student.fullName,
          fullName: student.fullName,
          role: 'student',
          course: student.course,
          gradeLevel: student.gradeLevel,
          nation: student.nation
        };

      } else {
        return res.status(401).json({ message: 'Invalid token payload' });
      }

      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Authorize specific roles
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Role '${req.user.role}' is not authorized to access this route` 
      });
    }

    next();
  };
};