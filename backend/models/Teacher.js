import mongoose from "mongoose";

// Standalone Teacher Schema
const teacherSchema = new mongoose.Schema({
  teacherId: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  fullName: {
    type: String,
    required: true, 
    trim: true,
  },
  dob: {
    type: String,
    required: true,
  },
  course: {
    type: String,
    required: true,
    trim: true,
  },
  dateJoined: {
    type: String,
    required: true,
  },
  teacherImg: {
    type: String,
    required: true,
  },
  nation: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
teacherSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Add indexes for better query performance
teacherSchema.index({ email: 1 });
teacherSchema.index({ teacherId: 1 });
teacherSchema.index({ isActive: 1 });

const Teacher = mongoose.model("Teacher", teacherSchema);

export default Teacher;
