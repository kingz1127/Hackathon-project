import mongoose from "mongoose";

const paymentSubmissionSchema = new mongoose.Schema({
  submissionId: { type: String, required: true, unique: true },
  studentId: { type: String, required: true },
  studentName: String,
  originalPaymentId: { type: String, required: true }, // Reference to the original payment
  amount: { type: Number, required: true },
  paymentMethod: String,
  transactionId: String,
  receiptFile: String,
  notes: String,
  status: { type: String, default: 'pending' }, // pending, approved, declined
  submittedAt: { type: Date, default: Date.now },
  reviewedAt: Date,
  adminNotes: String,
  paymentDescription: String
});

export default mongoose.model('PaymentSubmission', paymentSubmissionSchema);