const express = require('express');
const router = express.Router();
const Interaction = require('../models/Interaction');

// @route   GET /api/interactions/check
// @desc    Check if two drugs interact
// @usage   /api/interactions/check?drugA=Aspirin&drugB=Warfarin
router.get('/check', async (req, res) => {
  const { drugA, drugB } = req.query;

  try {
    // Search for a conflict (checking both A-B and B-A order)
    const interaction = await Interaction.findOne({
      $or: [
        { drugA: drugA, drugB: drugB },
        { drugA: drugB, drugB: drugA }
      ]
    });

    if (interaction) {
      res.json(interaction); // Found a danger!
    } else {
      res.json(null); // No conflict found
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;  