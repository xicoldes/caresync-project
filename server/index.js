require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// --- IMPORT ROUTES ---
const medicineRoutes = require('./routes/medicineRoutes');
const interactionRoutes = require('./routes/interactionRoutes'); 
const fdaRoutes = require('./routes/fdaRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes'); // ✅ ADDED

const app = express();

// --- MIDDLEWARE ---
app.use(cors()); 
app.use(express.json());

// DEBUG LOGGER
app.use((req, res, next) => {
  console.log(`📡 [${new Date().toLocaleTimeString()}] Request: ${req.method} ${req.url}`);
  next();
});

// --- DATABASE CONNECTION ---
connectDB();

// --- ROUTE HANDLERS ---
app.use('/api/medicines', medicineRoutes);
app.use('/api/safety', interactionRoutes); 
app.use('/api/fda', fdaRoutes);
app.use('/api/user', userRoutes);
app.use('/api/auth', authRoutes); // ✅ ADDED: This fixes the 404 error

// --- START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));