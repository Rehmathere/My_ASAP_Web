const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  image:{type:String , default:""},
  Name: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  experience: { type: String },
  zipCode: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true }, 
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, // Reference to the Product model   
  details:{type : String},
  userType: { type: String, default: 'SELLER' },
  isActive: { type: Boolean, default: true },
  country: { type: String, required: true }, 
  city: { type: String, required: true }, 
  isDeleted: { type: Boolean, default: false },
  dateAdded: { type: Date, default: Date.now },
});
const Seller = mongoose.model("Seller", userSchema);

module.exports = Seller;
