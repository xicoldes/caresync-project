const mongoose = require('mongoose');

const MedicineSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  brandName: {
    type: String,
    required: true
  },
  genericName: {
    type: String
  },
  warnings: {
    type: String
  },
  // --- NEW FIELDS ---
  rxcui: {
    type: String, // The ID code
    default: null
  },
  pharmClass: {
    type: String, // e.g. "Antibiotic"
    default: "Unknown"
  },
  // ------------------
  dateAdded: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Medicine', MedicineSchema);