require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// --- IMPORT ROUTES ---
const medicineRoutes = require('./routes/medicineRoutes');
const interactionRoutes = require('./routes/interactionRoutes'); 
const fdaRoutes = require('./routes/fdaRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// --- MIDDLEWARE ---

// 1. CORS FIX (Allow All Origins)
// We replaced the specific list with this simple command.
// This allows your Railway frontend, Localhost, and any other device to connect.
app.use(cors()); 

// 2. JSON Parser (Allows server to read data sent from frontend)
app.use(express.json());

// 3. DEBUG LOGGER (Helps you see requests in the terminal)
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

// --- START SERVER ---
// Railway automatically provides a PORT, otherwise use 5000 for localhost
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));