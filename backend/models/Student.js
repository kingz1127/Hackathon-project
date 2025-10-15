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

  // ✅ Add this field to link student → teacher
  teacherId: {
    type: String,
    // required: true, // you can make it optional if needed
  },

  gradeLevel: {
    type: String,
    required: true,
  },
  guardian: {
    type: String,
    required: true,
  },
  guardianPhoneNumber: {
    type: String,
    required: true,
  },
  phoneNumber: {
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
  stateOfOrigin: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  gender: {
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
  notifications: [
    {
      id: String,
      sender: String,
      senderId: String,
      message: String,
      type: String,
      isRead: Boolean,
      time: String,
    },
  ],
  messages: [
    {
      sender: String, // admin/teacher name
      message: String,
      timestamp: { type: Date, default: Date.now },
      isRead: { type: Boolean, default: false },
    },
  ],
});

studentSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("Student", studentSchema);
