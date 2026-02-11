require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import Routes
const medicineRoutes = require('./routes/medicineRoutes');
const interactionRoutes = require('./routes/interactionRoutes'); // Ensure this file exists
const fdaRoutes = require('./routes/fdaRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// --- MIDDLEWARE ---
app.use(express.json());
app.use(cors());

// --- 🔍 DEBUG LOGGER (Critical) ---
// This will print a message in your terminal whenever you click "Check"
app.use((req, res, next) => {
  console.log(`📡 [${new Date().toLocaleTimeString()}] Request: ${req.method} ${req.url}`);
  next();
});

// Connect to Database
connectDB();

// --- ROUTES ---
app.use('/api/medicines', medicineRoutes);
// ✅ NEW MAP: This tells the server to send "/safety" requests to the interaction checker
app.use('/api/safety', interactionRoutes); 
app.use('/api/fda', fdaRoutes);
app.use('/api/user', userRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));