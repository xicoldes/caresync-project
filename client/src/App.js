import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';
import { Routes, Route, useNavigate } from 'react-router-dom';

// --- COMPONENTS ---
import DrugSearch from './components/DrugSearch';
import MyCabinet from './components/MyCabinet';
import InteractionChecker from './components/InteractionChecker';
import DrugBrowse from './components/DrugBrowse';

// NOTE: HealthTips component was removed as per feature cleanup
// import HealthTips from './components/HealthTips'; 

function App() {
  // --- STATE MANAGEMENT ---
  // Remove 'medicines' if you aren't using it
  const [, setMedicines] = useState([]);
  
  // Used to force a re-render of components when the logo is clicked (Hard Reset)
  const [refreshKey, setRefreshKey] = useState(0); 
  
  // Reference for scrolling to the "Drugs A-Z" section
  const browseRef = useRef(null);
  
  // Hook for programmatic navigation (changing URLs)
  const navigate = useNavigate();

  // --- EFFECT: INITIAL DATA FETCH ---
  // Runs once when the app loads to get the full medicine list
  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const res = await axios.get('https://caresync-project-production-fff5.up.railway.app/api/medicines');
        setMedicines(res.data);
      } catch (error) { 
        console.error("Error fetching initial data:", error); 
      }
    };
    fetchMedicines();
  }, []);

  // --- HANDLERS ---

  // 1. Logo Click Handler (Hard Reset)
  // Resets the view, clears search state by updating the key, and scrolls to top
  const handleLogoClick = (e) => {
    e.preventDefault();
    setRefreshKey(prev => prev + 1); // Increments key to force re-render
    navigate('/'); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 2. Navigation to "Drugs A-Z"
  // Goes to homepage and scrolls down to the browse section
  const handleAZClick = () => {
    navigate('/'); 
    // Small timeout ensures the page has loaded before scrolling
    setTimeout(() => {
      browseRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // 3. Handling selection from the Browse List
  // Updates URL with the selected drug name so DrugSearch picks it up
  const handleBrowseSelect = (drugName) => {
    navigate(`/?q=${encodeURIComponent(drugName)}`); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="App">
      
      {/* --- HEADER SECTION --- */}
      <header>
        <div className="header-top">
          {/* Logo - Triggers the Hard Reset */}
          <a href="/" className="logo-container" onClick={handleLogoClick}>
            <span className="logo-icon">💊</span> 
            <span className="logo-text">CareSync</span>
          </a>
          
          {/* Authentication Buttons (Placeholder) */}
          <div className="auth-buttons">
            <button>Register</button>
            <button className="sign-in">Sign In</button>
          </div>
        </div>

        {/* Navigation Bar */}
        <nav className="main-nav">
          <ul>
            <li onClick={handleAZClick}>Drugs A-Z</li>
            <li onClick={() => navigate('/cabinet')}>Saved Medicines</li>
            {/* DELETED: Symptom Checker Link (Feature Removed) */}
            {/* UPDATED: Renamed from "Safety Checks" to "Drug Interaction Check" */}
            <li onClick={() => navigate('/interactions')}>Drug Interaction Check</li>
          </ul>
        </nav>
      </header>

      {/* --- ROUTING SECTION --- */}
      <Routes>
        
        {/* 1. HOMEPAGE ROUTE (/) */}
        <Route path="/" element={
          <>
            {/* Hero Section: Main Title and Search Bar */}
            <section className="hero-section">
              <h1 className="hero-title">Know more. Be sure.</h1>
              <p className="hero-subtitle">Simplifying healthcare. One search at a time.</p>
              
              <div className="hero-search-wrapper">
                {/* Key prop forces component reset when logo is clicked */}
                <DrugSearch key={refreshKey} />
              </div>
            </section>

            {/* Feature Icons: Quick access to tools */}
            <section className="icon-grid">
              <div className="feature-icon-card" onClick={() => navigate('/cabinet')}>
                <div className="circle-icon">💊</div>
                <div className="feature-title">Saved Medicines</div>
              </div>
              
              {/* DELETED: Health & Symptom Guide Card */}

              <div className="feature-icon-card" onClick={() => navigate('/interactions')}>
                <div className="circle-icon">⚠️</div>
                <div className="feature-title">Drug Interaction Check</div>
              </div>
            </section>

            {/* Browse Section: Alphabetical list (Referenced by browseRef) */}
            <div ref={browseRef}>
              <DrugBrowse onSelectDrug={handleBrowseSelect} />
            </div>
          </>
        } />

        {/* 2. SAVED MEDICINES ROUTE (/cabinet) */}
        <Route path="/cabinet" element={
          <div style={{padding: '20px'}}>
             <MyCabinet />
             {/* REMOVED: Duplicate "Back to Home" button. 
                 It is now integrated inside MyCabinet.js for better UI. */}
          </div>
        } />

        {/* DELETED: Route path="/tips" (Feature Removed) */}

        {/* 3. INTERACTION CHECKER ROUTE (/interactions) */}
        <Route path="/interactions" element={
          <div style={{padding: '20px'}}>
             <InteractionChecker />
             {/* REMOVED: Duplicate "Back to Home" button. 
                 It is now integrated inside InteractionChecker.js for better UI. */}
          </div>
        } />

      </Routes>
    </div>
  );
}

// REMOVED: const backButtonStyle = { ... } 
// Reason: The buttons using this style were removed from App.js.

export default App;