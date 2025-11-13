// models/Receipt.js - UPDATED VERSION
import mongoose from "mongoose";

const receiptItemSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    default: 'payment'
  }
}, { _id: false });

const receiptSchema = new mongoose.Schema({
  receiptNumber: {  // ✅ Changed from receiptId to match your backend
    type: String,
    required: true,
    unique: true,
  },
  studentId: {
    type: String,
    required: true,
  },
  studentName: {
    type: String,
    required: true,
  },
  studentEmail: {  // ✅ ADD THIS
    type: String,
  },
  studentCourse: { // ✅ ADD THIS
    type: String,
  },
  paymentId: {     // ✅ ADD THIS to link to payment
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  items: [receiptItemSchema],
  subtotal: {
    type: Number,
    required: true,
  },
  tax: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['completed', 'pending', 'cancelled', 'refunded'],
    default: 'completed'
  },
  date: {          // ✅ Changed from issuedDate to match your backend
    type: Date,
    default: Date.now,
  },
  // ✅ REMOVE issuedTime - we'll calculate it when needed
}, {
  timestamps: true
});

// Generate receipt number automatically
receiptSchema.pre('save', async function(next) {
  if (!this.receiptNumber) {
    const count = await mongoose.model('Receipt').countDocuments();
    this.receiptNumber = `RCP-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

export default mongoose.model("Receipt", receiptSchema);