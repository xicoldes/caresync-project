const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Route matches: /api/safety/check
router.post('/check', async (req, res) => {
  const { drugs } = req.body;

  if (!drugs || !Array.isArray(drugs) || drugs.length < 2) {
    return res.status(400).json({ message: "Please select at least 2 drugs to check." });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `
      Act as a pharmacist. Analyze this drug combination: ${JSON.stringify(drugs)}
      Check for SEVERE interactions.
      Return strictly a JSON object. Format:
      {
        "safe": boolean,
        "severity": "None" | "Low" | "Moderate" | "Severe",
        "summary": "Short explanation",
        "details": ["Detail 1"]
      }
    `;

    console.log(`🤖 AI Processing: ${drugs.join(', ')}`);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rawText = response.text();

    // Clean JSON
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid AI response");

    const data = JSON.parse(jsonMatch[0]);
    res.json(data);

  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;