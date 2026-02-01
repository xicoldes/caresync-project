import React, { useState } from 'react';
import { DRUG_LIST } from '../data/drugList';

function DrugBrowse({ onSelectDrug }) {
  const [selectedLetter, setSelectedLetter] = useState('A');
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Browse Drugs A-Z</h2>
      <p style={{color: '#666', marginBottom: '20px'}}>
        Browse detailed information for the most common prescription and OTC medicines.
      </p>

      {/* ALPHABET BAR */}
      <div style={styles.alphaBar}>
        {alphabet.map((letter) => (
          <button
            key={letter}
            onClick={() => setSelectedLetter(letter)}
            style={{
              ...styles.alphaBtn,
              backgroundColor: selectedLetter === letter ? '#1e5bbd' : '#f0f0f0',
              color: selectedLetter === letter ? 'white' : '#333',
            }}
          >
            {letter}
          </button>
        ))}
      </div>

      {/* DRUG LIST AREA */}
      <div style={styles.listContainer}>
        <h3 style={styles.listHeader}>Most Common '{selectedLetter}' Drugs</h3>
        
        <div style={styles.grid}>
          {DRUG_LIST[selectedLetter] ? (
            DRUG_LIST[selectedLetter].map((drug, index) => (
              <div 
                key={index} 
                onClick={() => onSelectDrug(drug)} // This triggers the search!
                style={styles.drugItem}
              >
                {drug}
              </div>
            ))
          ) : (
            <p>No common drugs listed for this letter.</p>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: '900px', margin: '40px auto', fontFamily: 'Arial, sans-serif' },
  header: { fontSize: '2rem', fontFamily: 'Georgia, serif', color: '#111' },
  
  alphaBar: { display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '30px' },
  alphaBtn: {
    padding: '8px 12px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '0.9rem',
    transition: 'all 0.2s'
  },

  listContainer: { backgroundColor: '#fff', border: '1px solid #ddd', padding: '25px', borderRadius: '8px' },
  listHeader: { borderBottom: '2px solid #1e5bbd', paddingBottom: '10px', marginBottom: '20px', fontSize: '1.5rem', fontFamily: 'Georgia, serif' },
  
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' },
  drugItem: {
    color: '#1e5bbd',
    cursor: 'pointer',
    padding: '5px',
    fontSize: '1rem',
    textDecoration: 'none'
  }
};

export default DrugBrowse;