import mongoose from 'mongoose';

const gradeSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment'
    // Optional - for assignment grades (links to submissions)
  },
  gradeType: {
    type: String,
    enum: ['assignment', 'quiz', 'midterm', 'final', 'participation', 'project', 'other'],
    required: true
  },
  title: {
    type: String,
    required: true // e.g., "Quiz 1", "Midterm Exam", "Class Participation"
  },
  score: {
    type: Number,
    required: true,
    min: 0
  },
  maxScore: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number
  },
  letterGrade: {
    type: String // A, B+, C, etc.
  },
  comments: {
    type: String
  },
  semester: {
    type: String,
    required: true
  },
  academicYear: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Calculate percentage before saving
gradeSchema.pre('save', function(next) {
  if (this.score !== undefined && this.maxScore !== undefined) {
    this.percentage = ((this.score / this.maxScore) * 100).toFixed(2);
    
    // Calculate letter grade
    const percent = this.percentage;
    if (percent >= 90) this.letterGrade = 'A';
    else if (percent >= 85) this.letterGrade = 'A-';
    else if (percent >= 80) this.letterGrade = 'B+';
    else if (percent >= 75) this.letterGrade = 'B';
    else if (percent >= 70) this.letterGrade = 'B-';
    else if (percent >= 65) this.letterGrade = 'C+';
    else if (percent >= 60) this.letterGrade = 'C';
    else if (percent >= 55) this.letterGrade = 'C-';
    else if (percent >= 50) this.letterGrade = 'D';
    else this.letterGrade = 'F';
  }
  next();
});

export default mongoose.model('Grade', gradeSchema);