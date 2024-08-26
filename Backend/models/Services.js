const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  isDeleted: { type: Boolean, default: false },
  dateAdded: { type: Date, default: Date.now },
});
const Services = mongoose.model("Services", userSchema);

module.exports = Services;
