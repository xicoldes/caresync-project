const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Define a simple Schema inline (or import it if you have a model file)
// This Schema now includes 'details' to store the full AI report
const CabinetSchema = new mongoose.Schema({
  brandName: String,
  genericName: String,
  details: Object, // Stores the full purpose, usage, warnings, etc.
  createdAt: { type: Date, default: Date.now }
});

const CabinetItem = mongoose.model('CabinetItem', CabinetSchema);

// --- GET ALL MEDICINES ---
router.get('/medicines', async (req, res) => {
  try {
    const items = await CabinetItem.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ADD MEDICINE ---
router.post('/add', async (req, res) => {
  try {
    const { brandName, genericName, details } = req.body;
    
    // Check if already exists
    const existing = await CabinetItem.findOne({ brandName });
    if (existing) return res.status(400).json({ message: "Item already in cabinet" });

    const newItem = new CabinetItem({
      brandName,
      genericName,
      details // Save the full object
    });
    
    await newItem.save();
    res.json(newItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- REMOVE MEDICINE ---
router.delete('/remove/:id', async (req, res) => {
  try {
    await CabinetItem.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;