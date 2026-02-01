require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import Routes
const medicineRoutes = require('./routes/medicineRoutes');
const interactionRoutes = require('./routes/interactionRoutes');
const fdaRoutes = require('./routes/fdaRoutes');
const userRoutes = require('./routes/userRoutes');


const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to Database
connectDB();

// Use Routes
app.use('/api/medicines', medicineRoutes);
app.use('/api/interactions', interactionRoutes);
app.use('/api/fda', fdaRoutes);
app.use('/api/user', userRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));