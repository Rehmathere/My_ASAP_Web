const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true }, 
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, // Reference to the Product model
  location: { type: String, required: true },
  address: { type: String, required: true }, 
  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
  dateAdded: { type: Date, default: Date.now },
});
const Sellerform = mongoose.model("Sellerform", userSchema);

module.exports = Sellerform;
