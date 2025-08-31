import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  dob: {
    type: String,
    required: true,
  },
  course: {
    type: String,
    required: true,
  },
  gradeLevel: {
    type: String,
    required: true,
  },
  guardian: {
    type: String,
    required: true,
  },
  dateJoined: {
    type: String,
    required: true,
  },
  studentImg: {
    type: String,
    default: null,
  },
  nation: {
    type: String,
    required: true,
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
    default: null,
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

studentSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("Student", studentSchema);
