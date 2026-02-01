const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema({
  // We reference the names directly for simplicity in this student project
  drugA: { type: String, required: true }, 
  drugB: { type: String, required: true },
  severity: { 
    type: String, 
    enum: ['Low', 'Moderate', 'Severe'], 
    required: true 
  },
  description: String, // e.g. "Increases risk of bleeding"
  recommendation: String // e.g. "Consult doctor immediately"
});

module.exports = mongoose.model('Interaction', interactionSchema);