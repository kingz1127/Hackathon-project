import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  studentEmail: {
    type: String,
    required: true,
    default: 'N/A'
  },
  studentCourse: {
    type: String,
    required: true,
    default: 'N/A'
  },
  amount: {
    type: Number,
    required: true
  },
  amountPaid: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    enum: ['tuition', 'housing', 'meal_plan', 'fees', 'other'],
    default: 'tuition'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed', 'overdue', 'partial'],
    default: 'pending'
  },
  approvedAt: {
    type: Date
  },
  approvedBy: {
    type: String
  },
  notes: {
    type: String
  },
  // ✅ ADD THESE FOR AUTOMATIC RECEIPT TRACKING
  receiptGenerated: {
    type: Boolean,
    default: false
  },
  receiptId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Receipt'
  },
  lastReceiptUpdate: {
    type: Date
  }
}, {
  timestamps: true
});

export default mongoose.model('Payment', paymentSchema);