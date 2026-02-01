const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, default: "Demo Student" },
  savedMedicines: [
    {
      brandName: String,    // e.g. "Advil"
      genericName: String,  // e.g. "Ibuprofen"
      warnings: String      // We save the main warning so we don't need to ask FDA again
    }
  ]
});

module.exports = mongoose.model('User', userSchema);