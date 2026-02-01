const axios = require('axios');
require('dotenv').config();

const key = process.env.GOOGLE_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

console.log("🔍 Checking available models for your API Key...");

axios.get(url)
  .then(res => {
    console.log("\n✅ SUCCESS! Here are the models you can use:");
    const available = res.data.models.filter(m => m.supportedGenerationMethods.includes("generateContent"));
    
    if (available.length === 0) {
      console.log("⚠️ No 'generateContent' models found. Your API key might be restricted.");
    } else {
      available.forEach(m => console.log(`👉 ${m.name.replace('models/', '')}`));
    }
    console.log("\n------------------------------------------------");
  })
  .catch(err => {
    console.error("\n❌ ERROR LISTING MODELS:");
    if (err.response) {
      console.error(`Status: ${err.response.status}`);
      console.error(`Message: ${JSON.stringify(err.response.data, null, 2)}`);
    } else {
      console.error(err.message);
    }
  });