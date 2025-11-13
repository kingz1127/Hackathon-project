// models/FinancialAid.js
import mongoose from "mongoose";

const financialAidSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    ref: 'Student'
  },
  aidType: {
    type: String,
    enum: ['scholarship', 'loan', 'grant', 'work-study'],
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'denied', 'disbursed', 'cancelled'],
    default: 'pending'
  },
  term: {
    type: String,
    required: true, // e.g., "Spring 2024"
  },
  applicationDate: {
    type: Date,
    default: Date.now,
  },
  approvalDate: { 
    type: Date,
  },
  disbursementDate: {
    type: Date,
  },
  notes: String,
}, {
  timestamps: true
});

export default mongoose.model("FinancialAid", financialAidSchema);


