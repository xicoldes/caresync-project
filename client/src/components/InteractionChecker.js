import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function InteractionChecker() {
  const [drugInput, setDrugInput] = useState('');
  const [drugList, setDrugList] = useState([]); 
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // --- AUTO-COMPLETE STATE ---
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef(null); 

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (drugInput.length < 2) { setSuggestions([]); return; }
      try {
        const res = await axios.get(`https://clinicaltables.nlm.nih.gov/api/rxterms/v3/search?terms=${drugInput}&ef=DISPLAY_NAME`);
        setSuggestions((res.data[1] || []).slice(0, 6)); 
        setShowDropdown(true);
      } catch (err) { console.error(err); }
    };
    const delayDebounceFn = setTimeout(() => fetchSuggestions(), 200);
    return () => clearTimeout(delayDebounceFn);
  }, [drugInput]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

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

    // ✅ AUTOMATIC URL SELECTION
    // Uses REACT_APP_API_URL from .env or Dashboard, otherwise defaults to localhost:5000
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    try {
      const res = await axios.post(`${API_BASE_URL}/api/safety/check`, {
        drugs: drugList
      });
      setResult(res.data);
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.error || "Error checking drugs. Ensure backend is running.";
      alert(msg);
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <button onClick={() => navigate('/')} style={styles.backButton}>
        ← Back to Home
      </button>

      <div style={styles.header}>
        <h1 style={styles.title}>⚠️ Drug Interaction Check</h1>
        <p style={styles.subtitle}>
          Add medications to the list to check for potential dangerous interactions.
        </p>
      </div>

      <div style={{position: 'relative', marginBottom: '25px'}} ref={wrapperRef}>
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

        {showDropdown && suggestions.length > 0 && (
          <ul style={styles.dropdown}>
            {suggestions.map((item, index) => (
              <li key={index} style={styles.dropdownItem} onClick={() => selectSuggestion(item)}>
                <span style={{marginRight: '10px', color: '#ccc'}}>🔍</span>
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={styles.listContainer}>
        {drugList.length === 0 && <p style={{color:'#999', fontStyle:'italic'}}>List is empty.</p>}
        {drugList.map((drug, i) => (
          <span key={i} style={styles.drugTag}>
            {drug}
            <button onClick={() => removeDrug(drug)} style={styles.removeBtn}>×</button>
          </span>
        ))}
      </div>

      {drugList.length >= 2 && (
        <button 
          onClick={checkInteractions} 
          style={styles.checkBtn}
          disabled={loading}
        >
          {loading ? "Analyzing..." : "Check for Interactions"}
        </button>
      )}

      {result && (
        <div style={{
          ...styles.resultBox, 
          borderTop: result.safe ? '6px solid #28a745' : '6px solid #dc3545'
        }}>
          <h2 style={{
            marginTop:0, 
            marginBottom: '15px',
            color: result.safe ? '#28a745' : '#dc3545',
            display: 'flex', alignItems: 'center', gap: '10px'
          }}>
            {result.safe ? "✅ Safe Combination" : "⚠️ Potential Interaction"}
          </h2>
          
          <div style={styles.resultContent}>
            <p style={{fontSize: '1.1rem', marginBottom: '20px'}}>
              <strong>Severity:</strong> <span style={{
                padding: '4px 10px', borderRadius: '4px', fontSize: '0.9rem',
                backgroundColor: result.safe ? '#d4edda' : '#f8d7da',
                color: result.safe ? '#155724' : '#721c24'
              }}>{result.severity}</span>
            </p>
            
            <p style={{fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '20px'}}>{result.summary}</p>
            
            {result.details && result.details.length > 0 && (
               <ul style={{marginTop:'10px', paddingLeft:'20px', color: '#444'}}>
                 {result.details.map((detail, i) => (
                   <li key={i} style={{marginBottom:'12px', lineHeight: '1.6', fontSize: '1.05rem'}}>
                     {detail}
                   </li>
                 ))}
               </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: '800px', margin: '40px auto', padding: '0 20px', fontFamily: 'Arial, sans-serif' },
  backButton: { 
    background: 'none', border: 'none', color: '#666', 
    fontSize: '0.95rem', cursor: 'pointer', marginBottom: '20px', 
    padding: '8px 0', display: 'flex', alignItems: 'center', fontWeight: '500'
  },
  header: { marginBottom: '30px', textAlign: 'center' },
  title: { color: '#104c97', marginBottom: '10px', fontSize: '2.2rem' },
  subtitle: { color: '#666', fontSize: '1.1rem' },
  form: { display: 'flex', gap: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
  input: { flex: 1, padding: '15px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '1.1rem', outline: 'none' },
  addBtn: { padding: '15px 30px', backgroundColor: '#1e5bbd', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' },
  dropdown: { position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #eee', zIndex: 1000, listStyle: 'none', padding: 0, margin: '5px 0 0 0', borderRadius: '6px', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' },
  dropdownItem: { padding: '15px', borderBottom: '1px solid #f5f5f5', cursor: 'pointer', display: 'flex', alignItems: 'center', fontSize: '1rem' },
  listContainer: { marginBottom: '30px', display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' },
  drugTag: { backgroundColor: '#eef3fc', color: '#1e5bbd', padding: '10px 20px', borderRadius: '30px', display: 'flex', alignItems: 'center', fontWeight: '600', fontSize: '1rem' },
  removeBtn: { background: 'none', border: 'none', marginLeft: '10px', cursor: 'pointer', fontSize: '1.2rem', color: '#1e5bbd', opacity: 0.7 },
  checkBtn: { width: '100%', padding: '18px', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.2rem', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
  resultBox: { marginTop: '40px', padding: '35px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', border: '1px solid #f0f0f0' },
  resultContent: { color: '#333', textAlign: 'left' }
};

export default InteractionChecker;