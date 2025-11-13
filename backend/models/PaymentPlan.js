// models/PaymentPlan.js
import mongoose from "mongoose";

const paymentPlanSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    ref: 'Student',
    unique: true
  },
  planType: {
    type: String,
    enum: ['standard', 'extended', 'custom'],
    default: 'standard'
  },
  monthlyAmount: {
    type: Number,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  remainingAmount: {
    type: Number,
    required: true,
  },
  numberOfPayments: {
    type: Number,
    required: true,
  },
  remainingPayments: {
    type: Number,
    required: true,
  },
  nextPaymentDate: {
    type: Date,
    required: true,
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true, 
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled', 'defaulted'],
    default: 'active'
  },
}, {
  timestamps: true
});

export default mongoose.model("PaymentPlan", paymentPlanSchema);