const express = require('express');
const router = express.Router();
const User = require('../models/User');

// @route   POST /api/user/add
// @desc    Add a medicine to the user's cabinet
router.post('/add', async (req, res) => {
  // 1. Accept new fields (rxcui, pharmClass) from Frontend
  const { brandName, genericName, warnings, rxcui, pharmClass } = req.body;

  try {
    // 2. Find the Demo User (or create one if missing)
    let user = await User.findOne();
    if (!user) {
      user = await User.create({ name: "Demo Student", savedMedicines: [] });
    }

    // 3. Check if already saved (prevent duplicates)
    const exists = user.savedMedicines.find(m => m.brandName === brandName);
    if (exists) {
      return res.status(400).json({ message: "Medicine already in cabinet" });
    }

    // 4. Add to list and save (Now includes the new rich data)
    user.savedMedicines.push({ 
      brandName, 
      genericName, 
      warnings,
      rxcui,       // Saved!
      pharmClass   // Saved!
    });
    
    await user.save();

    res.json(user.savedMedicines); // Return the updated list
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route   GET /api/user/cabinet
// @desc    Get my saved medicines
router.get('/cabinet', async (req, res) => {
  try {
    let user = await User.findOne();
    if (!user) {
        user = await User.create({ name: "Demo Student", savedMedicines: [] });
    }
    res.json(user.savedMedicines);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;