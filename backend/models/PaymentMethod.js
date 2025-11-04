// models/PaymentMethod.js
import mongoose from "mongoose";

const paymentMethodSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    ref: 'Student'
  },
  type: {
    type: String,
    enum: ['card', 'bank'],
    required: true,
  },
  lastFour: {
    type: String,
    required: true,
  },
  cardType: {
    type: String, // Visa, Mastercard, etc.
  },
  bankName: {
    type: String,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  expiryDate: {
    type: String, // MM/YY format
  },
}, { 
  timestamps: true
});

// Ensure only one default payment method per student
paymentMethodSchema.pre('save', async function(next) {
  if (this.isDefault) {
    await mongoose.model('PaymentMethod').updateMany(
      { studentId: this.studentId, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

export default mongoose.model("PaymentMethod", paymentMethodSchema);


