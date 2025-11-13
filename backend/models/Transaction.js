// models/Transaction.js
import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    unique: true,
    sparse: true // Allow multiple null values, but enforce uniqueness when present
  },
  studentId: {
    type: String,
    required: true,
    index: true
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    required: true
  },
  submissionId: {
    type: String,
    ref: 'PaymentSubmission'
  },
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['payment', 'refund', 'adjustment'],
    default: 'payment'
  },
  description: {
    type: String,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'credit_card', 'debit_card', 'mobile_money', 'cash', 'other'],
    default: 'bank_transfer'
  },
  receiptFile: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'completed'
  },
  transactionDate: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
transactionSchema.index({ studentId: 1, transactionDate: -1 });
transactionSchema.index({ paymentId: 1 });
transactionSchema.index({ submissionId: 1 });

export default mongoose.model('Transaction', transactionSchema);