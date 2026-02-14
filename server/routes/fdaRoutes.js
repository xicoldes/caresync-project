const express = require('express');
const router = express.Router();
const axios = require('axios');
const Groq = require("groq-sdk"); 
const CachedDrug = require('../models/CachedDrug'); 
require('dotenv').config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// --- 🧠 HELPER 1: RESOLVE BRAND TO GENERIC ---
async function getGenericNameWithAI(brandName) {
  const prompt = `
    Convert the brand name "${brandName}" to its standard US FDA generic name.
    
    RULES:
    1. Use "Clavulanate Potassium" instead of "Clavulanic Acid".
    2. Use "Hydrochloride" instead of "HCL".
    3. Return strictly VALID JSON.
    
    Example: { "generic_name": "Amoxicillin and Clavulanate Potassium" }
  `;
  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "openai/gpt-oss-120b", // ✅ Using Groq's 120b model
      response_format: { type: "json_object" } 
    });
    
    const result = JSON.parse(completion.choices[0]?.message?.content || "{}");
    return result.generic_name?.trim() || null;
  } catch (error) {
    return null;
  }
}

// --- ⚡ HELPER 2: LOGIC MATCH (The "Purity" Filter) ---
function findBestMatchLogic(userQuery, results) {
    const q = userQuery.toLowerCase().trim();
    
    // SCORE CANDIDATES
    const scored = results.map(r => {
        let score = 0;
        const brands = (r.openfda?.brand_name || []).map(s => s.toLowerCase());
        const generics = (r.openfda?.generic_name || []).map(s => s.toLowerCase());
        const allNames = [...brands, ...generics];
        
        // 1. EXACT MATCH BONUSES
        if (generics.includes(q)) score += 100;
        if (brands.includes(q)) score += 100;

        // 2. COMBINATION PENALTY (The Augmentin Fix)
        // If user query does NOT have "and", "with", or "+", but the result DOES...
        // penalize it heavily so "Amoxicillin" beats "Amoxicillin and Clavulanate".
        const isCombo = (name) => name.includes(' and ') || name.includes(' with ') || name.includes('/') || name.includes('+');
        
        if (!isCombo(q)) {
            if (allNames.some(n => isCombo(n))) score -= 50; 
        }

        // 3. PEDIATRIC PENALTY (The Zyrtec Fix)
        if (!q.includes('child') && !q.includes('pediatric')) {
            if (allNames.some(n => n.includes('child') || n.includes('pediatric'))) score -= 100;
        }

        // 4. SUFFIX PENALTY (Hives, Allergy, Relief)
        if (allNames.some(n => n.includes('hives') || n.includes('allergy') || n.includes('relief'))) {
             if (!q.includes('hives') && !q.includes('allergy')) score -= 20;
        }

        // Keep the shortest name for display
        const shortestName = allNames.sort((a, b) => a.length - b.length)[0] || "";
        
        return { item: r, score, name: shortestName };
    });

    // Sort by score (descending) -> then by length (shortest first)
    scored.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.name.length - b.name.length;
    });

    // Safety: If best match is terrible (negative score), might return null, but for now take best.
    return scored[0]?.item || null;
}

// --- AI HELPER: ENRICHED SUMMARIZATION ---
async function simplifyWithAI(drugName, rawData) {
  const prompt = `
    You are an expert Senior Pharmacist. Write a detailed guide for "${drugName}".
    
    CRITICAL: 
    1. Identify the **ACTIVE GENERIC INGREDIENT** for 'standard_brand_name'.
    2. Supplement the FDA data with your general medical knowledge to ensure **detailed** responses.
    
    Return strictly VALID JSON:
    {
      "standard_brand_name": "Active Generic Name (Title Case)",
      "standard_generic_name": "Active Generic Name",
      "common_brands": ["List 3-4 common brand names"],
      "purpose": "Detailed explanation (2-3 sentences).",
      "usage": ["Instruction 1", "Instruction 2", "Instruction 3"],
      "side_effects": ["Effect 1", "Effect 2", "Effect 3", "Effect 4", "Effect 5"],
      "warnings": ["Warning 1", "Warning 2", "Warning 3"],
      "interactions": ["Interaction 1", "Interaction 2"],
      "storage": "Detailed storage instructions"
    }

    Data:
    ${JSON.stringify(rawData).substring(0, 15000)} 
  `;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "openai/gpt-oss-120b", 
      response_format: { type: "json_object" } 
    });
    return JSON.parse(completion.choices[0]?.message?.content || "{}");
  } catch (error) {
    return null; 
  }
}

// --- FALLBACK HELPER ---
const getFDAText = (item, field) => {
  if (field === 'purpose') return item.purpose ? item.purpose[0] : (item.indications_and_usage ? item.indications_and_usage[0] : null);
  if (field === 'warnings') return item.warnings ? item.warnings[0] : null;
  if (field === 'side_effects') return item.adverse_reactions ? item.adverse_reactions[0] : null;
  if (field === 'dosage') return item.dosage_and_administration ? item.dosage_and_administration[0] : null;
  return "Information not available.";
};

const toTitleCase = (str) => {
  if (!str) return "";
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

// --- ROUTES ---
router.post('/clear-cache', async (req, res) => {
    try {
        await CachedDrug.deleteMany({});
        res.json({ message: "Cache cleared." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/search', async (req, res) => {
  const { query } = req.query;
  const fdaKey = process.env.FDA_API_KEY;

  if (!query) return res.status(400).json({ message: "Search term required" });

  const cleanQuery = query.toLowerCase().trim();

  // 1. CACHE CHECK
  const cachedResult = await CachedDrug.findOne({ searchQuery: cleanQuery });
  if (cachedResult) return res.json([cachedResult.data]);

  // 2. SEARCH FDA (Primary)
  try {
    let fdaUrl = `https://api.fda.gov/drug/label.json?api_key=${fdaKey}&search=openfda.brand_name:"${query}"+openfda.generic_name:"${query}"&limit=50`;
    let response = await axios.get(fdaUrl).catch(() => null); 
    
    let fdaItem = null;
    let resolvedGenericName = null;

    if (response?.data?.results?.length > 0) {
        fdaItem = findBestMatchLogic(cleanQuery, response.data.results);
    } 
    
    // 3. FALLBACK: AI TRANSLATION (Fixes Curam)
    if (!fdaItem) {
       console.log("🤔 Direct match not found. Asking AI to translate...");
       resolvedGenericName = await getGenericNameWithAI(cleanQuery);
       
       if (resolvedGenericName) {
         console.log(`🧠 AI resolved "${cleanQuery}" to "${resolvedGenericName}"`);
         
         // Try Exact Generic Search
         let genericUrl = `https://api.fda.gov/drug/label.json?api_key=${fdaKey}&search=openfda.generic_name:"${resolvedGenericName}"&limit=20`;
         let genericResponse = await axios.get(genericUrl).catch(() => null);
         
         // 4. EMERGENCY FALLBACK: Partial Search (If "Amox and Clav Potassium" fails, try "Amoxicillin")
         if (!genericResponse && resolvedGenericName.includes(' ')) {
             const firstWord = resolvedGenericName.split(' ')[0];
             console.log(`⚠️ Full generic failed. Trying partial: "${firstWord}"`);
             genericUrl = `https://api.fda.gov/drug/label.json?api_key=${fdaKey}&search=openfda.generic_name:"${firstWord}"&limit=20`;
             genericResponse = await axios.get(genericUrl).catch(() => null);
         }

         if (genericResponse && genericResponse.data.results) {
            fdaItem = findBestMatchLogic(resolvedGenericName, genericResponse.data.results);
         }
       }
    }

    if (!fdaItem) throw new Error("Drug not found in FDA database.");

    // AI Summarization
    const meta = fdaItem.openfda || {};
    const finalGenericName = resolvedGenericName || (meta.generic_name ? toTitleCase(meta.generic_name[0]) : "Generic");
    
    console.log(`🤖 AI Summarizing: ${finalGenericName}...`);
    const aiData = await simplifyWithAI(finalGenericName, {
      indications: fdaItem.indications_and_usage,
      warnings: fdaItem.warnings,
      dosage: fdaItem.dosage_and_administration,
      reactions: fdaItem.adverse_reactions,
      interactions: fdaItem.drug_interactions
    });

    let finalResult = {};
    if (aiData) {
        finalResult = {
          source: "US FDA (AI Enhanced)",
          brandName: aiData.standard_brand_name, 
          genericName: aiData.standard_generic_name,
          brandNamesList: aiData.common_brands || [],
          pharm_class: meta.pharm_class_epc ? meta.pharm_class_epc[0] : "Unknown",
          rxcui: null, 
          purpose: aiData.purpose,
          dosage: aiData.usage,
          side_effects: aiData.side_effects,
          warnings: aiData.warnings,
          interactions: aiData.interactions,
          storage: aiData.storage 
        };
    } else {
        finalResult = {
          source: "US FDA (Raw)",
          brandName: toTitleCase(finalGenericName),
          genericName: toTitleCase(finalGenericName),
          brandNamesList: meta.brand_name ? meta.brand_name.slice(0, 5) : [],
          pharm_class: meta.pharm_class_epc ? meta.pharm_class_epc[0] : "Unknown",
          purpose: getFDAText(fdaItem, 'purpose'),
          dosage: getFDAText(fdaItem, 'dosage'),
          side_effects: getFDAText(fdaItem, 'side_effects'),
          warnings: getFDAText(fdaItem, 'warnings'),
          interactions: "See doctor"
        };
    }

    await new CachedDrug({ searchQuery: cleanQuery, data: finalResult }).save();
    res.json([finalResult]);

  } catch (error) {
    console.error("Search Error:", error.message);
    res.status(404).json({ message: "No drugs found." });
  }
});

module.exports = router;