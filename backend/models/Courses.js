import mongoose from 'mongoose';

const { Schema } = mongoose;

// Grade schema for each student in the course
const gradeSchema = new Schema({
  studentId: { type: String, required: true }, // student ID as string
  grade: { type: String, enum: ['A', 'B', 'C', 'D', 'F', 'Incomplete'], default: 'Incomplete' },
  score: { type: Number, min: 0, max: 100 }, // optional numeric score
});

// Subject/Class schema
const subjectSchema = new Schema({
  name: { type: String, required: true },
  modules: { type: Number, default: 0 },
  hours: { type: Number, default: 0 },
  description: { type: String },
});

// Main Course schema
const courseSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  duration: { type: String }, // e.g., "6 months"
  progress: { type: Number, default: 0 }, // overall course progress in %
  status: { type: String, enum: ['Not Started', 'In Progress', 'Completed'], default: 'Not Started' },
  instructor: { type: String, required: true }, // teacher linked by course
  category: { type: String },
  technologies: [String], // optional list of skills/technologies
  subjects: [subjectSchema], // array of classes/subjects
  grades: [gradeSchema], // array of student grades
  enrolledStudents: [String], // student IDs as strings
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model('Course', courseSchema);
