const express = require('express');
const router = express.Router();
const Medicine = require('../models/Medicine');

// @route   GET /api/medicines
// @desc    Get all medicines
// @access  Public
router.get('/', async (req, res) => {
  try {
    const medicines = await Medicine.find(); // Fetch everything from DB
    res.json(medicines); // Send it back as JSON
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;