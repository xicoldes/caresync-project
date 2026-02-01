require('dotenv').config(); // Load env from parent folder
const mongoose = require('mongoose');
const Medicine = require('../models/Medicine');
const Interaction = require('../models/Interaction');

// 1. Connect to DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('OPENING DB FOR SEEDING...'))
  .catch(err => console.log(err));

// 2. Sample Data
const sampleMedicines = [
  {
    name: "Panadol",
    activeIngredient: "Paracetamol",
    description: "Common pain reliever and fever reducer.",
    simplifiedDescription: "Good for headaches and fever. Safe for most people.",
    commonSideEffects: ["Nausea (rare)", "Rash (rare)"],
    warnings: ["Do not take more than 4000mg per day."]
  },
  {
    name: "Brufen",
    activeIngredient: "Ibuprofen",
    description: "Non-steroidal anti-inflammatory drug (NSAID).",
    simplifiedDescription: "Good for muscle pain and swelling. Take with food.",
    commonSideEffects: ["Stomach pain", "Heartburn", "Dizziness"],
    warnings: ["Avoid if you have stomach ulcers."]
  },
  {
    name: "Aspirin",
    activeIngredient: "Acetylsalicylic acid",
    description: "Blood thinner and pain reliever.",
    simplifiedDescription: "Keeps blood thin to prevent heart attacks.",
    commonSideEffects: ["Indigestion", "Bleeding more easily"],
    warnings: ["Stop taking before surgery."]
  },
  {
    name: "Warfarin",
    activeIngredient: "Warfarin",
    description: "Anticoagulant medication.",
    simplifiedDescription: "Strong blood thinner to prevent clots.",
    commonSideEffects: ["Severe bleeding", "Bruising"],
    warnings: ["Requires regular blood tests."]
  },
  {
    name: "Zyrtec",
    activeIngredient: "Cetirizine",
    description: "Antihistamine for allergies.",
    simplifiedDescription: "Stops runny nose and itchiness.",
    commonSideEffects: ["Drowsiness", "Dry mouth"],
    warnings: ["Be careful when driving."]
  }
];

const sampleInteractions = [
  {
    drugA: "Aspirin",
    drugB: "Warfarin",
    severity: "Severe",
    description: "Both drugs thin the blood. Taking them together significantly increases bleeding risk.",
    recommendation: "DO NOT COMBINE unless strictly monitored by a specialist."
  },
  {
    drugA: "Brufen",
    drugB: "Aspirin",
    severity: "Moderate",
    description: "Ibuprofen can reduce the heart-protecting effect of Aspirin.",
    recommendation: "Take Aspirin at least 30 minutes before Brufen."
  }
];

// 3. The Execution Function
const seedDB = async () => {
  try {
    // Clear existing data first
    await Medicine.deleteMany({});
    await Interaction.deleteMany({});
    console.log('--- Cleared Old Data ---');

    // Insert new data
    await Medicine.insertMany(sampleMedicines);
    await Interaction.insertMany(sampleInteractions);
    console.log('--- Inserted New Data ---');

    console.log('SUCCESS: Database seeded!');
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedDB();