const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ error: "Email already in use." });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashed });
    await user.save();
    
    console.log(`👤 New User Registered: ${username}`);
    res.json({ message: "User registered successfully!" });
  } catch (err) { 
    console.error("❌ Registration Error:", err.message);
    res.status(400).json({ error: "Registration failed. Try a different username/email." }); 
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret123');
    console.log(`🔑 User Logged In: ${user.username}`);
    res.json({ token, username: user.username });
  } catch (err) {
    res.status(500).json({ error: "Login error. Please try again." });
  }
});

module.exports = router;