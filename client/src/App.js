import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';
import { Routes, Route, useNavigate } from 'react-router-dom'; // Removed useLocation

// Components
import DrugSearch from './components/DrugSearch';
import MyCabinet from './components/MyCabinet';
import HealthTips from './components/HealthTips';
import InteractionChecker from './components/InteractionChecker';
import DrugBrowse from './components/DrugBrowse';

function App() {
  const [medicines, setMedicines] = useState([]);
  // Deleted obsolete searchQuery state here
  const [refreshKey, setRefreshKey] = useState(0); 
  const browseRef = useRef(null);

  const navigate = useNavigate();

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

  const handleLogoClick = (e) => {
    e.preventDefault();
    setRefreshKey(prev => prev + 1); 
    navigate('/'); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAZClick = () => {
    navigate('/'); 
    setTimeout(() => {
      browseRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleBrowseSelect = (drugName) => {
    // REPLACED: Instead of setting state, we push to the URL history
    navigate(`/?q=${encodeURIComponent(drugName)}`); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="App">
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

        <nav className="main-nav">
          <ul>
            <li onClick={handleAZClick}>Drugs A-Z</li>
            <li onClick={() => navigate('/cabinet')}>My Cabinet</li>
            <li onClick={() => navigate('/tips')}>Symptom Checker</li>
            <li onClick={() => navigate('/interactions')}>Safety Checks</li>
          </ul>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={
          <>
            <section className="hero-section">
              <h1 className="hero-title">Know more. Be sure.</h1>
              <p className="hero-subtitle">Simplifying healthcare. One search at a time.</p>
              <div className="hero-search-wrapper">
                {/* REMOVED: externalQuery prop is no longer needed, it reads from URL now */}
                <DrugSearch key={refreshKey} />
              </div>
            </section>

            <section className="icon-grid">
              <div className="feature-icon-card" onClick={() => navigate('/cabinet')}>
                <div className="circle-icon">💊</div>
                <div className="feature-title">My Medicine Cabinet</div>
              </div>
              <div className="feature-icon-card" onClick={() => navigate('/tips')}>
                <div className="circle-icon">🩺</div>
                <div className="feature-title">Health & Symptom Guide</div>
              </div>
              <div className="feature-icon-card" onClick={() => navigate('/interactions')}>
                <div className="circle-icon">⚠️</div>
                <div className="feature-title">Interaction Checker</div>
              </div>
            </section>

            <div ref={browseRef}>
              <DrugBrowse onSelectDrug={handleBrowseSelect} />
            </div>
          </>
        } />

        <Route path="/cabinet" element={
          <div style={{padding: '20px'}}>
             <MyCabinet />
             <button onClick={() => navigate('/')} style={backButtonStyle}>← Back to Home</button>
          </div>
        } />

        <Route path="/tips" element={
          <div style={{padding: '20px'}}>
             <HealthTips />
             <button onClick={() => navigate('/')} style={backButtonStyle}>← Back to Home</button>
          </div>
        } />

        <Route path="/interactions" element={
          <div style={{padding: '20px'}}>
             <InteractionChecker medicines={medicines} />
             <button onClick={() => navigate('/')} style={backButtonStyle}>← Back to Home</button>
          </div>
        } />
      </Routes>
    </div>
  );
}

const backButtonStyle = {
  marginTop: '20px', padding: '10px 20px', cursor: 'pointer',
  backgroundColor: '#f0f0f0', border: '1px solid #ccc', borderRadius: '4px'
};

export default App;