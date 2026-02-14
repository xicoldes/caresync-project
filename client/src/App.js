import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';
import { Routes, Route, useNavigate } from 'react-router-dom';

// --- COMPONENTS ---
import DrugSearch from './components/DrugSearch';
import MyCabinet from './components/MyCabinet';
import InteractionChecker from './components/InteractionChecker';
import DrugBrowse from './components/DrugBrowse';
import Auth from './components/Auth'; 

function App() {
  const [medicines, setMedicines] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0); 
  const browseRef = useRef(null);
  const navigate = useNavigate();

  const isLoggedIn = !!localStorage.getItem('token');
  const username = localStorage.getItem('username');

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        // ✅ FIXED: Changed port from 5001 to 5000 to match index.js
        const res = await axios.get('http://localhost:5000/api/medicines');
        setMedicines(res.data);
      } catch (error) { 
        console.error("Error fetching initial data:", error); 
      }
    };
    fetchMedicines();
  }, []);

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
    navigate(`/?q=${encodeURIComponent(drugName)}`); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    alert("Logged out successfully.");
    navigate('/');
    window.location.reload(); 
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
            {isLoggedIn ? (
              <>
                <span className="user-welcome">Hi, {username}!</span>
                <button className="sign-in" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <button onClick={() => navigate('/register')}>Register</button>
                <button className="sign-in" onClick={() => navigate('/signin')}>Sign In</button>
              </>
            )}
          </div>
        </div>

        <nav className="main-nav">
          <ul>
            <li onClick={handleAZClick}>Drugs A-Z</li>
            <li onClick={() => navigate('/cabinet')}>Saved Medicines</li>
            <li onClick={() => navigate('/interactions')}>Drug Interaction Check</li>
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
                <DrugSearch key={refreshKey} />
              </div>
            </section>

            <section className="icon-grid">
              <div className="feature-icon-card" onClick={() => navigate('/cabinet')}>
                <div className="circle-icon">💊</div>
                <div className="feature-title">Saved Medicines</div>
              </div>
              <div className="feature-icon-card" onClick={() => navigate('/interactions')}>
                <div className="circle-icon">⚠️</div>
                <div className="feature-title">Drug Interaction Check</div>
              </div>
            </section>

            <div ref={browseRef}>
              <DrugBrowse onSelectDrug={handleBrowseSelect} />
            </div>
          </>
        } />

        <Route path="/register" element={<Auth mode="register" />} />
        <Route path="/signin" element={<Auth mode="login" />} />

        <Route path="/cabinet" element={
          <div style={{padding: '20px'}}>
             <MyCabinet />
          </div>
        } />

        <Route path="/interactions" element={
          <div style={{padding: '20px'}}>
             <InteractionChecker />
          </div>
        } />
      </Routes>
    </div>
  );
}

export default App;