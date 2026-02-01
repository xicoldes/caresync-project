import React, { useState } from 'react';
import axios from 'axios';

function InteractionChecker({ medicines }) {
  const [drugA, setDrugA] = useState('');
  const [drugB, setDrugB] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkInteraction = async () => {
    if (!drugA || !drugB) return alert("Please select two medicines.");
    
    setLoading(true);
    setResult(null); // Reset previous result

    try {
      // Ask the backend server to check for conflicts
      const res = await axios.get(`/api/interactions/check?drugA=${drugA}&drugB=${drugB}`);
      setResult(res.data); // Save the answer (either a conflict object or null)
    } catch (error) {
      console.error(error);
      alert("Error checking interaction.");
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <h2>⚠️ Safety Check</h2>
      <p>Select two medicines to check for conflicts:</p>
      
      <div style={styles.inputGroup}>
        {/* Dropdown for Drug A */}
        <select value={drugA} onChange={(e) => setDrugA(e.target.value)} style={styles.select}>
          <option value="">Select Medicine 1</option>
          {medicines.map(med => <option key={med._id} value={med.name}>{med.name}</option>)}
        </select>

        <span style={{fontSize: '20px'}}>+</span>

        {/* Dropdown for Drug B */}
        <select value={drugB} onChange={(e) => setDrugB(e.target.value)} style={styles.select}>
          <option value="">Select Medicine 2</option>
          {medicines.map(med => <option key={med._id} value={med.name}>{med.name}</option>)}
        </select>
      </div>

      <button onClick={checkInteraction} style={styles.button} disabled={loading}>
        {loading ? "Checking..." : "Check Interactions"}
      </button>

      {/* --- DISPLAY RESULTS --- */}
      {result && (
        <div style={{ ...styles.resultBox, backgroundColor: '#ffebee', border: '1px solid #ffcdd2' }}>
          <h3 style={{ color: '#c62828' }}>❌ WARNING: {result.severity} Interaction</h3>
          <p><strong>Effect:</strong> {result.description}</p>
          <p><strong>Recommendation:</strong> {result.recommendation}</p>
        </div>
      )}

      {/* If search finished but result is null (Safe) */}
      {result === null && loading === false && drugA && drugB && (
        // Only show "Safe" if we actually clicked the button (logic is a bit simplified here)
        <p style={{ marginTop: '10px', color: 'green' }}></p> 
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    border: '2px solid #333',
    borderRadius: '10px',
    margin: '20px auto',
    maxWidth: '600px',
    backgroundColor: '#f9f9f9'
  },
  inputGroup: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: '20px'
  },
  select: {
    padding: '10px',
    fontSize: '16px',
    borderRadius: '5px'
  },
  button: {
    padding: '10px 20px',
    fontSize: '16px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  resultBox: {
    marginTop: '20px',
    padding: '15px',
    borderRadius: '5px',
    textAlign: 'left'
  }
};

export default InteractionChecker;