import mongoose from "mongoose";

const { Schema } = mongoose;

// Grade for a student
const gradeSchema = new Schema({
  studentId: { type: String, required: true },
  grade: { type: String, enum: ['A','B','C','D','F','Incomplete'], default: 'Incomplete' },
  score: { type: Number, min: 0, max: 100 },
});

// Submission for an assignment
const submissionSchema = new Schema({
  studentId: { type: String, required: true },
  grade: { type: String, enum: ['A','B','C','D','F','Incomplete'], default: 'Incomplete' },
  score: { type: Number, min: 0, max: 100 },
  fileUrl: { type: String }, // optional
});

// Assignment schema
const assignmentSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  dueDate: Date,
  submissions: [submissionSchema],
});

// Class/Subject schema (inside a section)
const subjectSchema = new Schema({
  name: { type: String, required: true },      // class name
  modules: { type: Number, default: 0 },
  hours: { type: Number, default: 0 },
  description: String,
  date: Date,                                   // class date
  time: String,                                 // class time
  assignments: [assignmentSchema],
});

// Section schema
const sectionSchema = new Schema({
  name: { type: String, required: true },     // section/branch name
  subjects: [subjectSchema],
});

// Main Course schema
const courseSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  level: { type: String, enum: ['Beginner','Intermediate','Advanced'], default: 'Beginner' },
  instructor: { type: String, required: true }, // teacher id
  sections: [sectionSchema],
  grades: [gradeSchema],
  enrolledStudents: [String],                  // student IDs
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Course", courseSchema);
