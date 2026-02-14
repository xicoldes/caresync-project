const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  savedMedicines: [{ type: Object }] // To store their drug list
});

module.exports = mongoose.model('User', UserSchema);