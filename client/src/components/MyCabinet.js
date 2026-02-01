import React, { useState, useEffect } from 'react';
import axios from 'axios';

function MyCabinet() {
  const [cabinet, setCabinet] = useState([]);

  useEffect(() => {
    const fetchCabinet = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/user/cabinet');
        setCabinet(res.data);
      } catch (error) {
        console.error("Error fetching cabinet", error);
      }
    };
    fetchCabinet();
  }, []);

  return (
    <div style={{maxWidth: '800px', margin: '20px auto', textAlign: 'left'}}>
      <h2>📂 My Medicine Cabinet</h2>
      {cabinet.length === 0 ? <p>No medicines saved yet.</p> : null}
      
      <div style={{display: 'flex', flexWrap: 'wrap', gap: '15px'}}>
        {cabinet.map((med, index) => (
          <div key={index} style={styles.card}>
            <h3>{med.brandName}</h3>
            <p style={{fontSize: '0.9em', color: '#666'}}>{med.genericName}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  card: {
    border: '1px solid #ccc',
    padding: '15px',
    borderRadius: '8px',
    width: '200px',
    backgroundColor: '#f9f9f9',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  }
};

export default MyCabinet;