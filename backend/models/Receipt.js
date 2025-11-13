// models/Receipt.js
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
}, { _id: false });

const receiptSchema = new mongoose.Schema({
  receiptId: {
    type: String,
    required: true,
    unique: true,
  },
  transactionId: {
    type: String,
    required: true,
    ref: 'Transaction'
  },
  studentId: {
    type: String,
    required: true,
    ref: 'Student'
  },
  studentName: {
    type: String,
    required: true,
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
    enum: ['completed', 'cancelled', 'refunded'],
    default: 'completed'
  },
  issuedDate: {
    type: Date,
    default: Date.now,
  },
  issuedTime: {
    type: String,
  },
}, {
  timestamps: true
});

// Generate receipt ID and time automatically
receiptSchema.pre('save', async function(next) {
  if (!this.receiptId) {
    const count = await mongoose.model('Receipt').countDocuments();
    this.receiptId = `RCP-${String(count + 1).padStart(6, '0')}`;
  }
  if (!this.issuedTime) {
    const date = new Date();
    this.issuedTime = date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    }); 
  }
  next();
});

export default mongoose.model("Receipt", receiptSchema);


