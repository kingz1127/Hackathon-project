// models/Finance.js
const mongoose = require("mongoose");

const FinanceSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  totalAmount: { type: Number, required: true },
  amountPaid: { type: Number, default: 0 },
  description: { type: String },
  datePaid: { type: Date, default: Date.now },
});

FinanceSchema.virtual("amountRemaining").get(function () {
  return this.totalAmount - this.amountPaid; 
});

FinanceSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Finance", FinanceSchema);
