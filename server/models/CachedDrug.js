// server/models/CachedDrug.js
const mongoose = require('mongoose');

const CachedDrugSchema = new mongoose.Schema({
  searchQuery: { type: String, required: true, unique: true }, // e.g. "amoxicillin"
  data: { type: Object, required: true }, // The full JSON result we send to frontend
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 30 } // Optional: Auto-delete after 30 days to keep data fresh
});

module.exports = mongoose.model('CachedDrug', CachedDrugSchema);