const express = require('express');
const router = express.Router();
const Groq = require("groq-sdk"); // ✅ Switched from Google AI to Groq
require('dotenv').config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Route matches: /api/safety/check
router.post('/check', async (req, res) => {
  const { drugs } = req.body;

  if (!drugs || !Array.isArray(drugs) || drugs.length < 2) {
    return res.status(400).json({ error: "Please select at least 2 drugs to check." });
  }

  try {
    const prompt = `
      Act as a pharmacist. Analyze this drug combination: ${JSON.stringify(drugs)}
      Check for dangerous interactions.
      Return strictly a VALID JSON object. No markdown.
      
      Structure:
      {
        "safe": boolean,
        "severity": "None" | "Low" | "Moderate" | "Severe",
        "summary": "Short 2-sentence explanation of the interaction.",
        "details": ["Specific warning 1", "Specific warning 2"]
      }
    `;

    console.log(`🤖 AI Analyzing Interactions: ${drugs.join(', ')}`);

    // ✅ UPDATED: Using GPT-OSS-120B on Groq as requested
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "openai/gpt-oss-120b",
      response_format: { type: "json_object" } 
    });

    const data = JSON.parse(completion.choices[0]?.message?.content || "{}");
    res.json(data);

  } catch (error) {
    console.error("❌ Interaction Check Error:", error.message);
    res.status(500).json({ error: "The AI is currently busy. Please try again in a few seconds." });
  }
});

module.exports = router;