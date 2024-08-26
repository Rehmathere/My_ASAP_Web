const mongoose = require("mongoose");

const subproductSchema = mongoose.Schema({
  name: { type: String, required: true },
  isDeleted: { type: Boolean, default: false },
  dateAdded: { type: Date, default: Date.now },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' } // Reference to the Category model
}, { timestamps: true });

const Subproduct = mongoose.model("Subproduct", subproductSchema);

module.exports = Subproduct;
