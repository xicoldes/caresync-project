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
  }
];

// --- 🧠 HELPER 1: RESOLVE BRAND TO GENERIC ---
async function getGenericNameWithAI(brandName) {
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
  
  const prompt = `
    What is the active generic ingredient for the drug brand "${brandName}"?
    Return the standard US FDA generic name.
    
    Rules:
    1. Keep it simple. Omit chemical states like "trihydrate" or "succinate" unless necessary.
    2. Example: Return "Amoxicillin and Clavulanate" instead of "Amoxicillin trihydrate and potassium clavulanate".
    3. Return ONLY the name. No punctuation.
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

// --- 🧠 HELPER 2: PICK BEST MATCH (UPDATED) ---
async function findBestMatchWithAI(userQuery, fdaResults) {
  if (!fdaResults || fdaResults.length === 0) return null;
  
  const simplifiedList = fdaResults.map((item, index) => {
     const brand = item.openfda?.brand_name ? item.openfda.brand_name[0] : "Unknown";
     const generic = item.openfda?.generic_name ? item.openfda.generic_name[0] : "Unknown";
     return `${index}: Brand="${brand}", Generic="${generic}"`;
  }).join("\n");

  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
  
  // UPDATED PROMPT: Explicitly prefers the shortest name (General) over specific variants
  const prompt = `
    User searched for: "${userQuery}"
    I have these results from the FDA:
    ${simplifiedList}

    Task: Select the index of the MAIN, GENERAL version of the drug.
    
    Rules:
    1. Prefer exact brand matches (e.g. "Zyrtec") over specific variants (e.g. "Zyrtec Allergy" or "Zyrtec-D") IF possible.
    2. Avoid "Children's" versions unless the user asked for it.
    3. If the user searched a generic name, pick the most standard brand representative.
    
    Return ONLY the index number (e.g. "0").
  `;

  try {
    const result = await model.generateContent(prompt);
    const index = parseInt(result.response.text().trim());
    return isNaN(index) ? fdaResults[0] : fdaResults[index];
  } catch (error) {
    return fdaResults[0]; 
  }
}

// --- AI HELPER: SUMMARIZATION (MAJOR UPDATE) ---
async function simplifyWithAI(drugName, rawData) {
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  // UPDATED PROMPT: AI now generates the Display Name and Brand List
  const prompt = `
    You are an expert pharmacist providing a detailed consultation. 
    Analyze the FDA data below for the drug "${drugName}".
    
    Task 1: Identify the "Standard Display Name". 
    (e.g., If the data says "Zyrtec Allergy" but the main drug is "Zyrtec", just return "Zyrtec").

    Task 2: Provide a comprehensive patient summary.
    
    Return strictly VALID JSON.
    Structure:
    {
      "standard_brand_name": "The cleanest, most general brand name for this drug (Title Case)",
      "standard_generic_name": "The clean generic name",
      "common_brands": ["Brand 1", "Brand 2", "Brand 3"],
      "purpose": "Detailed explanation of what this drug treats and how it works (2-3 sentences).",
      "usage": ["Specific instruction 1", "Specific instruction 2"],
      "side_effects": ["Common side effect 1", "Common side effect 2", "Serious side effect"],
      "warnings": ["Critical warning 1", "Critical warning 2"],
      "interactions": ["Drug 1 to avoid", "Interaction 2"]
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

const toTitleCase = (str) => {
  if (!str) return "";
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

// --- 🧹 CLEAR CACHE ---
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

  // --- STEP 3: SEARCH FDA ---
  try {
    let fdaUrl = `https://api.fda.gov/drug/label.json?api_key=${fdaKey}&search=openfda.brand_name:"${query}"+openfda.generic_name:"${query}"&limit=10`; // Increased limit to find better matches
    let response = await axios.get(fdaUrl).catch(() => null); 
    
    let fdaItem = null;
    let resolvedGenericName = null;

    if (response?.data?.results?.length > 0) {
        console.log("🔍 Found multiple results. Asking AI to pick the best one...");
        fdaItem = await findBestMatchWithAI(cleanQuery, response.data.results);
    } 
    
    // Fallback: Translate Brand -> Generic
    if (!fdaItem) {
       console.log("🤔 Direct match not found. Asking AI to translate brand...");
       resolvedGenericName = await getGenericNameWithAI(cleanQuery);
       
       if (resolvedGenericName) {
         const genericUrl = `https://api.fda.gov/drug/label.json?api_key=${fdaKey}&search=openfda.generic_name:"${resolvedGenericName}"&limit=5`;
         const genericResponse = await axios.get(genericUrl).catch(() => null);
         
         if (genericResponse && genericResponse.data.results) {
            fdaItem = await findBestMatchWithAI(resolvedGenericName, genericResponse.data.results);
            console.log(`✅ Found FDA data using generic: ${resolvedGenericName}`);
         }
       }
    }

    if (!fdaItem) throw new Error("Drug not found");

    const meta = fdaItem.openfda || {};
    // Determine the name to send to AI for summarization
    const nameForAI = resolvedGenericName ? toTitleCase(cleanQuery) : (meta.brand_name ? meta.brand_name[0] : meta.generic_name?.[0]);

    console.log(`🤖 AI Summarizing: ${nameForAI}...`);
    const aiData = await simplifyWithAI(nameForAI, {
      indications: fdaItem.indications_and_usage,
      warnings: fdaItem.warnings,
      dosage: fdaItem.dosage_and_administration,
      reactions: fdaItem.adverse_reactions,
      interactions: fdaItem.drug_interactions
    });

    // --- REPLACED LOGIC: Use AI-determined names instead of raw FDA names ---
    // Reason: FDA names like "ZYRTEC Allergy" are too specific. AI provides cleaner "Zyrtec".
    
    const finalResult = {
      source: "US FDA",
      brandName: aiData?.standard_brand_name || toTitleCase(nameForAI), // Prefer AI's clean name
      genericName: aiData?.standard_generic_name || toTitleCase(meta.generic_name?.[0] || "Generic"),
      brandNamesList: aiData?.common_brands || (meta.brand_name ? meta.brand_name.slice(0, 5) : []), // Prefer AI's clean list
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
    }

    try {
      await new CachedDrug({ searchQuery: cleanQuery, data: finalResult }).save();
      console.log("💾 Saved to Cache");
    } catch (saveErr) { console.error("Cache Save Error:", saveErr.message); }

    res.json([finalResult]);

  } catch (error) {
    console.error("Search Error:", error.message);
    
    if (localMatch) {
       return res.json([{ ...localMatch, source: "SG Database (Offline)" }]);
    }

    res.status(404).json({ message: "No drugs found." });
  }
});

module.exports = router;