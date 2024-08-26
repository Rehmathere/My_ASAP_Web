const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  Name: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true }, 
  address: { type: String },
  zipCode:{type:String}, 
  userType: { type: String, default: 'USER' },
  isDeleted: { type: Boolean, default: false },
  dateAdded: { type: Date, default: Date.now },
});
const User = mongoose.model("User", userSchema);

module.exports = User;
