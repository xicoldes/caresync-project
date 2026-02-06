import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';

// Components
import DrugSearch from './components/DrugSearch';
import MyCabinet from './components/MyCabinet';
import HealthTips from './components/HealthTips';
import InteractionChecker from './components/InteractionChecker';
import DrugBrowse from './components/DrugBrowse';

function App() {
  const [view, setView] = useState('home'); 
  const [medicines, setMedicines] = useState([]);
  const [searchQuery, setSearchQuery] = useState(''); 
  
  // This 'key' is a trick to force React to reset the Search Component
  const [refreshKey, setRefreshKey] = useState(0); 

  // Ref to scroll to the A-Z section
  const browseRef = useRef(null);

  // Fetch medicines
  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/medicines');
        setMedicines(res.data);
      } catch (error) { console.error(error); }
    };
    fetchMedicines();
  }, []);

  // --- HANDLERS ---

  // 1. Logo Click: Resets EVERYTHING (Clears search, goes home, scrolls top)
  const handleLogoClick = (e) => {
    e.preventDefault();
    setView('home');
    setSearchQuery(''); // Clear any active A-Z filter
    setRefreshKey(prev => prev + 1); // Force DrugSearch to re-render (clear results)
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 2. Drugs A-Z Click: Scrolls down to the Browse section
  const handleAZClick = () => {
    setView('home');
    // Wait for view to switch, then scroll
    setTimeout(() => {
      browseRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // 3. Browse Select: When clicking a drug in the A-Z list
  const handleBrowseSelect = (drugName) => {
    setSearchQuery(drugName);
    setView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="App">
      {/* --- HEADER --- */}
      <header>
        <div className="header-top">
          <a href="/" className="logo-container" onClick={handleLogoClick}>
            <span className="logo-icon">💊</span> 
            <span className="logo-text">CareSync</span>
          </a>
          <div className="auth-buttons">
            <button>Register</button>
            <button className="sign-in">Sign In</button>
          </div>
        </div>

        {/* --- NAV BAR --- */}
        <nav className="main-nav">
          <ul>
            <li onClick={handleAZClick}>Drugs A-Z</li>
            <li onClick={() => setView('cabinet')}>My Cabinet</li>
            <li onClick={() => setView('tips')}>Symptom Checker</li>
            <li onClick={() => setView('interactions')}>Safety Checks</li>
          </ul>
        </nav>
      </header>

      {/* --- DYNAMIC CONTENT --- */}
      
      {/* HOME VIEW */}
      {view === 'home' && (
        <>
          <section className="hero-section">
            <h1 className="hero-title">Know more. Be sure.</h1>
            <p className="hero-subtitle">Simplifying healthcare. One search at a time.</p>
            
            <div className="hero-search-wrapper">
              {/* key={refreshKey} ensures this component wipes clean when logo is clicked */}
              <DrugSearch key={refreshKey} externalQuery={searchQuery} />
            </div>
          </section> 

          <section className="icon-grid">
            <div className="feature-icon-card" onClick={() => setView('cabinet')}>
              <div className="circle-icon">💊</div>
              <div className="feature-title">My Medicine Cabinet</div>
            </div>

            <div className="feature-icon-card" onClick={() => setView('tips')}>
              <div className="circle-icon">🩺</div>
              <div className="feature-title">Health & Symptom Guide</div>
            </div>

            <div className="feature-icon-card" onClick={() => setView('interactions')}>
              <div className="circle-icon">⚠️</div>
              <div className="feature-title">Interaction Checker</div>
            </div>
          </section>

          {/* Attach Ref here so we can scroll to it */}
          <div ref={browseRef}>
            <DrugBrowse onSelectDrug={handleBrowseSelect} />
          </div>
        </>
      )}

      {/* --- OTHER VIEWS --- */}
      {view === 'cabinet' && (
        <div style={{padding: '20px'}}>
           <MyCabinet />
           <button onClick={handleLogoClick} style={backButtonStyle}>← Back to Home</button>
        </div>
      )}

      {view === 'tips' && (
        <div style={{padding: '20px'}}>
           <HealthTips />
           <button onClick={handleLogoClick} style={backButtonStyle}>← Back to Home</button>
        </div>
      )}

      {view === 'interactions' && (
        <div style={{padding: '20px'}}>
           <InteractionChecker medicines={medicines} />
           <button onClick={handleLogoClick} style={backButtonStyle}>← Back to Home</button>
        </div>
      )}

    </div>
  );
}

const backButtonStyle = {
  marginTop: '20px', 
  padding: '10px 20px', 
  cursor: 'pointer',
  backgroundColor: '#f0f0f0',
  border: '1px solid #ccc',
  borderRadius: '4px'
};

export default App;