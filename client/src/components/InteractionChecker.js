import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function InteractionChecker() {
  const [drugInput, setDrugInput] = useState('');
  const [drugList, setDrugList] = useState([]); 
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- AUTO-COMPLETE STATE ---
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef(null); // To detect clicks outside

  // --- 1. FETCH SUGGESTIONS (RxNav API) ---
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (drugInput.length < 2) { 
        setSuggestions([]); 
        return; 
      }
      try {
        const res = await axios.get(`https://clinicaltables.nlm.nih.gov/api/rxterms/v3/search?terms=${drugInput}&ef=DISPLAY_NAME`);
        // The API returns [count, [names], ...], we want index 1
        setSuggestions((res.data[1] || []).slice(0, 6)); 
        setShowDropdown(true);
      } catch (err) { console.error(err); }
    };

    // Debounce to prevent too many API calls
    const delayDebounceFn = setTimeout(() => fetchSuggestions(), 200);
    return () => clearTimeout(delayDebounceFn);
  }, [drugInput]);

  // --- 2. CLICK OUTSIDE TO CLOSE ---
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  // --- HANDLERS ---

  const addDrug = (e) => {
    if (e) e.preventDefault();
    if (drugInput.trim() && !drugList.includes(drugInput.trim())) {
      setDrugList([...drugList, drugInput.trim()]);
      setDrugInput('');
      setSuggestions([]);
      setResult(null); 
    }
  };

  const selectSuggestion = (name) => {
    if (!drugList.includes(name)) {
      setDrugList([...drugList, name]);
      setResult(null);
    }
    setDrugInput('');
    setSuggestions([]);
    setShowDropdown(false);
  };

  const removeDrug = (drug) => {
    setDrugList(drugList.filter(d => d !== drug));
    setResult(null);
  };

  const checkInteractions = async () => {
    if (drugList.length < 2) {
      alert("Please add at least 2 drugs to check.");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/safety/check', {
        drugs: drugList
      });
      setResult(res.data);
    } catch (error) {
      alert("Error checking drugs. See Browser Console (F12) for details.");
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>⚠️ Drug Interaction Check</h1>
      <p style={styles.subtitle}>
        Add medications to the list to check for potential dangerous interactions.
      </p>

      {/* INPUT SECTION WITH DROPDOWN */}
      <div style={{position: 'relative', marginBottom: '20px'}} ref={wrapperRef}>
        <form onSubmit={addDrug} style={styles.form}>
          <input
            type="text"
            placeholder="Enter drug name (e.g. Panadol)"
            value={drugInput}
            onChange={(e) => setDrugInput(e.target.value)}
            style={styles.input}
            autoComplete="off"
          />
          <button type="submit" style={styles.addBtn}>+ Add</button>
        </form>

        {/* DROPDOWN LIST */}
        {showDropdown && suggestions.length > 0 && (
          <ul style={styles.dropdown}>
            {suggestions.map((item, index) => (
              <li 
                key={index} 
                style={styles.dropdownItem} 
                onClick={() => selectSuggestion(item)}
              >
                <span style={{marginRight: '10px', color: '#ccc'}}>🔍</span>
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* DRUG LIST */}
      <div style={styles.listContainer}>
        {drugList.length === 0 && <p style={{color:'#999', fontStyle:'italic'}}>List is empty.</p>}
        {drugList.map((drug, i) => (
          <span key={i} style={styles.drugTag}>
            {drug}
            <button onClick={() => removeDrug(drug)} style={styles.removeBtn}>×</button>
          </span>
        ))}
      </div>

      {/* CHECK BUTTON */}
      {drugList.length >= 2 && (
        <button 
          onClick={checkInteractions} 
          style={styles.checkBtn}
          disabled={loading}
        >
          {loading ? "Analyzing..." : "Check for Interactions"}
        </button>
      )}

      {/* RESULTS DISPLAY */}
      {result && (
        <div style={{
          ...styles.resultBox, 
          borderLeft: result.safe ? '5px solid #28a745' : '5px solid #dc3545'
        }}>
          <h2 style={{marginTop:0, color: result.safe ? '#28a745' : '#dc3545'}}>
            {result.safe ? "✅ Safe Combination" : "⚠️ Potential Interaction"}
          </h2>
          <p><strong>Severity:</strong> {result.severity}</p>
          <p>{result.summary}</p>
          
          {result.details && result.details.length > 0 && (
             <ul style={{marginTop:'10px', paddingLeft:'20px'}}>
               {result.details.map((detail, i) => <li key={i}>{detail}</li>)}
             </ul>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: '700px', margin: '0 auto', fontFamily: 'Arial, sans-serif' },
  title: { color: '#104c97', borderBottom: '1px solid #eee', paddingBottom: '10px' },
  subtitle: { color: '#666', marginBottom: '20px' },
  
  form: { display: 'flex', gap: '10px' },
  input: { flex: 1, padding: '12px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '1rem', outline: 'none' },
  addBtn: { padding: '10px 20px', backgroundColor: '#1e5bbd', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  
  // New Dropdown Styles
  dropdown: { position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #ccc', zIndex: 1000, listStyle: 'none', padding: 0, margin: '5px 0 0 0', borderRadius: '4px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
  dropdownItem: { padding: '12px', borderBottom: '1px solid #eee', cursor: 'pointer', display: 'flex', alignItems: 'center' },

  listContainer: { marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '10px' },
  drugTag: { backgroundColor: '#eef3fc', color: '#1e5bbd', padding: '8px 15px', borderRadius: '20px', display: 'flex', alignItems: 'center', fontWeight: '500' },
  removeBtn: { background: 'none', border: 'none', marginLeft: '10px', cursor: 'pointer', fontSize: '1.2rem', color: '#1e5bbd' },
  
  checkBtn: { width: '100%', padding: '15px', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '4px', fontSize: '1.1rem', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' },
  resultBox: { marginTop: '30px', padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }
};

export default InteractionChecker;