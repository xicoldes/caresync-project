const express = require('express');
const router = express.Router();
const axios = require('axios');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const CachedDrug = require('../models/CachedDrug'); 
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// --- LOCAL SINGAPORE DRUG DATABASE ---
const LOCAL_DRUGS = [
  {
    brandName: "Curam",
    genericName: "Amoxicillin and Clavulanate",
    manufacturer: "Sandoz",
    description: "Antibiotic used to treat bacterial infections.",
    purpose: "Curam is an antibiotic used for respiratory, skin, and urinary tract infections.",
    warnings: "Do not take if you are allergic to Penicillin.",
    do_not_use: "If you have a history of liver problems caused by this drug."
  },
  {
    brandName: "Panadol Extra",
    genericName: "Acetaminophen",
    manufacturer: "GSK",
    description: "Stronger pain reliever for bad headaches.",
    purpose: "Panadol Extra provides relief from mild to moderate pain and fever.",
    warnings: "Contains caffeine. Do not exceed 8 tablets in 24 hours.",
    do_not_use: "If you have severe liver failure."
  },
  // ... (Add your other local drugs here)
];

// --- 🧠 NEW HELPER 1: RESOLVE BRAND TO GENERIC ---
async function getGenericNameWithAI(brandName) {
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
  const prompt = `
    What is the active generic ingredient for the drug brand "${brandName}"?
    Only return the generic name. Nothing else. No punctuation.
    Example: If I ask "Panadol", you return "Acetaminophen".
  `;
  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim().replace(/\.$/, ''); 
    console.log(`🧠 AI Translation: "${brandName}" -> "${text}"`);
    return text;
  } catch (error) {
    console.error("❌ Brand Resolution Error:", error.message);
    return null;
  }
}

// --- 🧠 NEW HELPER 2: PICK BEST MATCH (Fixes Zyrtec Issue) ---
// This function gives the AI the list of FDA results and asks it to pick the "standard" one.
async function findBestMatchWithAI(userQuery, fdaResults) {
  if (!fdaResults || fdaResults.length === 0) return null;
  
  // Create a simplified list for the AI to read (Brand + Generic)
  const simplifiedList = fdaResults.map((item, index) => {
     const brand = item.openfda?.brand_name ? item.openfda.brand_name[0] : "Unknown";
     const generic = item.openfda?.generic_name ? item.openfda.generic_name[0] : "Unknown";
     return `${index}: Brand="${brand}", Generic="${generic}"`;
  }).join("\n");

  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
  const prompt = `
    User searched for: "${userQuery}"
    I have these results from the FDA:
    ${simplifiedList}

    Which index number represents the MAIN, STANDARD, ADULT version of the drug? 
    Avoid "Children's" or "pm" versions unless the user asked for them.
    Return ONLY the index number (e.g. "0" or "2"). If none match well, return "0".
  `;

  try {
    const result = await model.generateContent(prompt);
    const index = parseInt(result.response.text().trim());
    console.log(`🧠 AI Selected Index ${index} for query "${userQuery}"`);
    return isNaN(index) ? fdaResults[0] : fdaResults[index];
  } catch (error) {
    console.error("❌ Match Selection Error:", error.message);
    return fdaResults[0]; // Fallback to first result
  }
}

// --- AI HELPER: SUMMARIZATION ---
async function simplifyWithAI(drugName, rawData) {
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  const prompt = `
    You are an expert pharmacist providing a detailed consultation. 
    Analyze the FDA data below for the drug "${drugName}" and provide a comprehensive, informative summary for a patient.
    
    Provide specific, useful details.
    
    Return strictly VALID JSON. No Markdown. No code blocks.
    Structure:
    {
      "purpose": "Detailed explanation of what this drug treats and how it works (2-3 sentences).",
      "usage": ["Specific instruction 1 (e.g., take with food)", "Specific instruction 2 (e.g., dosage timing)", "What to do if missed dose"],
      "side_effects": ["Common side effect 1", "Common side effect 2", "Serious side effect to watch for"],
      "warnings": ["Critical warning 1 (e.g., pregnancy safety)", "Critical warning 2 (e.g., alcohol use)", "Who should NOT take this"],
      "interactions": ["Drug class 1 to avoid", "Specific medication interaction", "Food/Supplement interaction"]
    }

    Data:
    ${JSON.stringify(rawData).substring(0, 15000)}
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    text = text.replace(/```json|```/g, '').trim();
    return JSON.parse(text);
  } catch (error) {
    console.error("❌ AI Error:", error.message);
    return null; 
  }
}

// --- FALLBACK HELPER ---
const getFDAText = (item, field) => {
  if (field === 'purpose') return item.purpose ? item.purpose[0] : (item.indications_and_usage ? item.indications_and_usage[0] : null);
  if (field === 'warnings') return item.warnings ? item.warnings[0] : null;
  if (field === 'side_effects') return item.adverse_reactions ? item.adverse_reactions[0] : null;
  if (field === 'dosage') return item.dosage_and_administration ? item.dosage_and_administration[0] : null;
  return null;
};

// --- HELPER: Title Case ---
const toTitleCase = (str) => {
  if (!str) return "";
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

// --- 🧹 CLEAR CACHE ROUTE ---
router.post('/clear-cache', async (req, res) => {
    try {
        await CachedDrug.deleteMany({});
        console.log("🧹 Cache Cleared!");
        res.json({ message: "Cache cleared successfully." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/search', async (req, res) => {
  const { query } = req.query;
  const fdaKey = process.env.FDA_API_KEY;

  if (!query) return res.status(400).json({ message: "Search term required" });

  const cleanQuery = query.toLowerCase().trim();

  // --- ⚡ STEP 1: CHECK CACHE ---
  try {
    const cachedResult = await CachedDrug.findOne({ searchQuery: cleanQuery });
    if (cachedResult) {
      console.log(`⚡ Serving "${cleanQuery}" from Cache`);
      return res.json([cachedResult.data]);
    }
  } catch (err) {
    console.error("Cache Check Error:", err.message);
  }

  // --- STEP 2: CHECK LOCAL DB ---
  const localMatch = LOCAL_DRUGS.find(d => d.brandName.toLowerCase() === cleanQuery);

  // --- STEP 3: SEARCH FDA (SMART LOGIC) ---
  try {
    // A. Initial Search
    let fdaUrl = `https://api.fda.gov/drug/label.json?api_key=${fdaKey}&search=openfda.brand_name:"${query}"+openfda.generic_name:"${query}"&limit=5`;
    let response = await axios.get(fdaUrl).catch(() => null); 
    
    let fdaItem = null;
    let resolvedGenericName = null;

    // B. Check for results
    if (response?.data?.results && response.data.results.length > 0) {
        // 🧠 CALL THE NEW AI HELPER HERE
        console.log("🔍 Found multiple results. Asking AI to pick the best one...");
        fdaItem = await findBestMatchWithAI(cleanQuery, response.data.results);
    } 
    
    // C. If still no good match, try translating brand -> generic
    if (!fdaItem) {
       console.log("🤔 Direct match not found. Asking AI to translate brand...");
       resolvedGenericName = await getGenericNameWithAI(cleanQuery);
       
       if (resolvedGenericName) {
         const genericUrl = `https://api.fda.gov/drug/label.json?api_key=${fdaKey}&search=openfda.generic_name:"${resolvedGenericName}"&limit=5`;
         const genericResponse = await axios.get(genericUrl).catch(() => null);
         
         if (genericResponse && genericResponse.data.results) {
            // Ask AI to pick best match from Generic results too
            fdaItem = await findBestMatchWithAI(resolvedGenericName, genericResponse.data.results);
            console.log(`✅ Found FDA data using generic: ${resolvedGenericName}`);
         }
       }
    }

    if (!fdaItem) throw new Error("Drug not found");

    const meta = fdaItem.openfda || {};
    const finalDrugName = resolvedGenericName ? toTitleCase(cleanQuery) : (meta.brand_name ? meta.brand_name[0] : meta.generic_name?.[0]);
    const finalGenericName = resolvedGenericName || (meta.generic_name ? toTitleCase(meta.generic_name[0]) : "Generic");

    // ✨ CALL AI FOR DETAILS ✨
    console.log(`🤖 AI Summarizing: ${finalDrugName}...`);
    const aiData = await simplifyWithAI(finalDrugName, {
      indications: fdaItem.indications_and_usage,
      warnings: fdaItem.warnings,
      dosage: fdaItem.dosage_and_administration,
      reactions: fdaItem.adverse_reactions,
      interactions: fdaItem.drug_interactions
    });

    // Build Result
    const finalResult = {
      source: "US FDA",
      brandName: toTitleCase(finalDrugName),
      genericName: toTitleCase(finalGenericName),
      brandNamesList: meta.brand_name ? meta.brand_name.slice(0, 5) : [], 
      pharm_class: meta.pharm_class_epc ? meta.pharm_class_epc[0] : "Unknown Class",
      rxcui: null, 

      purpose: aiData?.purpose || getFDAText(fdaItem, 'purpose'),
      dosage: aiData?.usage || getFDAText(fdaItem, 'dosage'),
      side_effects: aiData?.side_effects || getFDAText(fdaItem, 'side_effects'),
      warnings: aiData?.warnings || getFDAText(fdaItem, 'warnings'),
      interactions: aiData?.interactions || "No interaction data available."
    };

    if (localMatch) {
      finalResult.source = "SG Database + FDA";
      if (cleanQuery === localMatch.brandName.toLowerCase()) {
         finalResult.brandName = localMatch.brandName; 
      }
      if (!finalResult.brandNamesList.includes(localMatch.brandName)) {
        finalResult.brandNamesList.unshift(localMatch.brandName);
      }
    }

    // --- 💾 SAVE TO CACHE ---
    try {
      await new CachedDrug({ searchQuery: cleanQuery, data: finalResult }).save();
      console.log("💾 Saved to Cache");
    } catch (saveErr) {
      console.error("Cache Save Error:", saveErr.message);
    }

    res.json([finalResult]);

  } catch (error) {
    console.error("Search Error:", error.message);
    if (localMatch) return res.json([{ ...localMatch, source: "SG Database" }]);
    res.status(404).json({ message: "No drugs found." });
  }
});

module.exports = router;