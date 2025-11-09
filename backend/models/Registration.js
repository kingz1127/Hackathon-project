import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  Email: {
    type: String,
    required: true,
    lowercase: true,
  },
  FullName: {
    type: String,
    required: true,
  },
  DOfB: {
    type: String,
    required: true,
  },
  Course: {
    type: String,
    required: true,
  },
  Country: {
    type: String,
    required: true,
  },
  PhoneNumber: {
    type: String,
    required: true,
  },
  Grade: {
    type: String,
    required: true,
  },
  Guardian: {
    type: String,
    required: true,
  },
  GuardianPhoneNumber: {
    type: String,
    required: true,
  },
  StateOfOrigin: {
    type: String,
    required: true,
  },
  Address: {
    type: String,
    required: true,
  },
  Gender: {
    type: String,
    required: true,
  },
  passportPhoto: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected'],
    default: 'pending',
  },
  adminNotes: {
    type: String,
    default: null,
  },
  reviewedBy: {
    type: String,
    default: null,
  },
  reviewedAt: {
    type: Date,
    default: null,
  },
  studentId: {
    type: String,
    default: null,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Registration", registrationSchema);