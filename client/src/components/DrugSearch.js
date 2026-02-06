import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';

function DrugSearch() { 
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get('q') || ''; 

  const [query, setQuery] = useState(urlQuery);
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef(null); 

  useEffect(() => {
    if (urlQuery) {
      setQuery(urlQuery);
      fetchDrugData(urlQuery);
    } else {
      setQuery('');
      setSelectedDrug(null);
    }
  }, [urlQuery]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) { setSuggestions([]); return; }
      try {
        const res = await axios.get(`https://clinicaltables.nlm.nih.gov/api/rxterms/v3/search?terms=${query}&ef=DISPLAY_NAME`);
        setSuggestions((res.data[1] || []).slice(0, 8));
        setShowDropdown(true);
      } catch (err) { console.error(err); }
    };
    const delayDebounceFn = setTimeout(() => fetchSuggestions(), 200);
    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const fetchDrugData = async (searchTerm) => {
    if (!searchTerm) return;
    setLoading(true);
    setError('');
    setSelectedDrug(null);
    setShowDropdown(false);

    try {
      const res = await axios.get(`http://localhost:5000/api/fda/search?query=${searchTerm}`);
      if (res.data && res.data.length > 0) {
        setSelectedDrug(res.data[0]);
      } else { 
        throw new Error("No results found."); 
      }
    } catch (err) {
      setError("No results found. Try checking your spelling.");
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault(); 
    setSearchParams({ q: query }); 
  };

  const selectSuggestion = (suggestion) => {
    setQuery(suggestion);
    setShowDropdown(false);
    setSearchParams({ q: suggestion });
  };

  // --- UPDATED SAVE FUNCTION ---
  const addToCabinet = async (drug) => {
    try {
      await axios.post('http://localhost:5000/api/user/add', {
        brandName: drug.brandName,
        genericName: drug.genericName,
        details: drug 
      });
      // Updated Success Message
      alert(`Success! ${drug.brandName} added to your Saved Medicines.`);
    } catch (err) { 
      console.error(err);
      // ✅ IMPROVED ERROR: Shows the actual message from the backend
      // This will likely say "Item already in cabinet" if you saved it before
      const message = err.response?.data?.message || "Could not save medicine. Check backend connection.";
      alert(`Error: ${message}`); 
    }
  };

  const formatContent = (content) => {
    if (!content) return "Information not available.";
    if (Array.isArray(content)) {
      return (
        <ul style={{paddingLeft: '20px', margin: 0, color: '#333'}}>
          {content.map((item, i) => (
            <li key={i} style={{marginBottom: '8px', lineHeight: '1.6'}}>{item}</li>
          ))}
        </ul>
      );
    }
    let clean = content;
    clean = clean.replace(/SECTION \d+:/gi, "").trim();
    clean = clean.replace(/(\b\d+\s+[A-Z\s]{3,})/g, "\n\n### $1\n");
    clean = clean.replace(/(\(\d+\))/g, "\n$1");
    clean = clean.replace(/(\d+\.)/g, "\n$1");
    clean = clean.replace(/(•|-)\s/g, "\n• ");
    const lines = clean.split('\n');
    return (
      <div style={{lineHeight: '1.6', color: '#333'}}>
        {lines.map((line, i) => {
          let s = line.trim();
          if (s.length < 2) return null;
          if (s.startsWith("###")) {
             return <h4 key={i} style={{color: '#104c97', marginTop: '15px', marginBottom: '5px', borderBottom:'1px solid #eee'}}>{s.replace('###', '')}</h4>;
          }
          if (s.match(/^(\(\d+\)|\d+\.|•)/)) {
             return (
               <div key={i} style={{marginBottom: '5px', paddingLeft: '15px', display: 'flex'}}>
                 <span style={{marginRight: '8px', fontWeight:'bold'}}>•</span>
                 <span>{s.replace(/^[•\d.()]+\s*/, '')}</span>
               </div>
             );
          }
          return <p key={i} style={{marginBottom: '10px'}}>{s}</p>;
        })}
      </div>
    );
  };

  const DrugSection = ({ id, title, emoji, content }) => {
    if (!content || content === "No info") return null;
    return (
      <div id={id} style={styles.sectionCard}>
        <h2 style={styles.cardTitle}>
          <span style={{marginRight: '10px'}}>{emoji}</span>
          {title}
        </h2>
        <div style={styles.cardContent}>{formatContent(content)}</div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={{marginBottom: '30px'}}>
        <div style={{position: 'relative'}} ref={wrapperRef}>
          <form onSubmit={handleSearch} style={styles.searchBox}>
            <input 
              type="text" 
              placeholder="Search for a medication..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={styles.input}
              onFocus={() => query.length >= 2 && setShowDropdown(true)}
              autoComplete="off"
            />
            <button id="search-btn" type="submit" style={styles.button}>
              {loading ? "Searching..." : "Search"}
            </button>
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
        {error && <div style={styles.error}>{error}</div>}
      </div>

      {selectedDrug && (
        <div style={styles.drugContainer}>
          
          <div style={styles.headerBlock}>
            <h1 style={styles.mainTitle}>{selectedDrug.brandName}</h1>
            <div style={styles.metaData}>
              <p><strong>Generic name:</strong> {selectedDrug.genericName}</p>
              {selectedDrug.brandNamesList && selectedDrug.brandNamesList.length > 0 && (
                 <p><strong>Brand names:</strong> {selectedDrug.brandNamesList.join(', ')}</p>
              )}
              {selectedDrug.pharm_class && (
                <p><strong>Drug class:</strong> {selectedDrug.pharm_class}</p>
              )}
            </div>
            <div style={styles.navBar}>
                <a href="#overview" style={styles.navLink}>Overview</a> <span style={styles.sep}>|</span>
                <a href="#side-effects" style={styles.navLink}>Side effects</a> <span style={styles.sep}>|</span>
                <a href="#warnings" style={styles.navLink}>Warnings</a> <span style={styles.sep}>|</span>
                <a href="#dosage" style={styles.navLink}>Dosage</a> <span style={styles.sep}>|</span>
                <a href="#interactions" style={styles.navLink}>Interactions</a>
            </div>
          </div>

          {/* RENAME: Updated button text */}
          <button onClick={() => addToCabinet(selectedDrug)} style={styles.addButton}>+ Save to List</button>

          <DrugSection id="overview" emoji="💊" title={`What is ${selectedDrug.brandName}?`} content={selectedDrug.purpose} />
          <DrugSection id="dosage" emoji="📋" title="How to take" content={selectedDrug.dosage} />
          <DrugSection id="side-effects" emoji="🤢" title="Side Effects" content={selectedDrug.side_effects} />

          {selectedDrug.warnings && selectedDrug.warnings.length > 0 && (
            <div id="warnings" style={styles.warningCard}>
               <h2 style={styles.warningTitle}>⚠️ Warnings</h2>
               <div style={styles.cardContent}>{formatContent(selectedDrug.warnings)}</div>
            </div>
          )}
          <DrugSection id="interactions" emoji="⚡" title="Interactions" content={selectedDrug.interactions} />
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: '900px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif', color: '#111', textAlign: 'left' },
  searchBox: { display: 'flex', border: '1px solid #ccc', borderRadius: '4px' },
  input: { flex: 1, padding: '12px', fontSize: '1rem', border: 'none', outline: 'none' },
  button: { padding: '10px 25px', backgroundColor: '#1e5bbd', color: 'white', border: 'none', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold' },
  dropdown: { position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #ccc', zIndex: 1000, listStyle: 'none', padding: 0, margin: 0 },
  dropdownItem: { padding: '10px', borderBottom: '1px solid #eee', cursor: 'pointer' },
  error: { marginTop: '10px', color: 'red' },
  headerBlock: { borderBottom: '1px solid #ddd', paddingBottom: '20px', marginBottom: '30px' },
  mainTitle: { fontFamily: 'Georgia, serif', fontSize: '2.5rem', margin: '0 0 10px 0', color: '#000' },
  metaData: { fontSize: '0.95rem', lineHeight: '1.6', color: '#333', marginBottom: '20px' },
  navBar: { marginTop: '15px', fontSize: '0.95rem' },
  navLink: { color: '#1e5bbd', textDecoration: 'none', cursor: 'pointer', fontWeight: '500' },
  sep: { color: '#ccc', margin: '0 8px' },
  addButton: { float: 'right', marginTop: '-70px', padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  sectionCard: { backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '25px', marginBottom: '25px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
  cardTitle: { marginTop: 0, marginBottom: '15px', fontSize: '1.5rem', color: '#333', borderBottom: '1px solid #eee', paddingBottom: '10px', display: 'flex', alignItems: 'center', fontFamily: 'Georgia, serif' },
  cardContent: { fontSize: '1.05rem' },
  warningCard: { backgroundColor: '#fffdf5', border: '1px solid #ffeeba', borderLeft: '5px solid #ffc107', borderRadius: '8px', padding: '25px', marginBottom: '25px' },
  warningTitle: { marginTop: 0, marginBottom: '15px', fontSize: '1.5rem', color: '#856404', borderBottom: '1px solid #f5c6cb', paddingBottom: '10px', fontFamily: 'Georgia, serif' }
};

export default DrugSearch;