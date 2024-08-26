// models/Payment.js
const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  sessionId: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isPaid: { type: Boolean, default: false },
  dateAdded: { type: Date, default: Date.now },
  expired:{type:Boolean,default:false}
  // Add more payment-related fields as needed
});

const Payment = mongoose.model("Payment", PaymentSchema);

module.exports = Payment;
