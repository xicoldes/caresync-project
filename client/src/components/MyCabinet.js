import React, { useState, useEffect } from 'react';
import axios from 'axios';

function MyCabinet() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDrug, setSelectedDrug] = useState(null); // For the Modal

  // --- FETCH MEDICINES ---
  const fetchCabinet = async () => {
    try {
      // NOTE: Ensure your backend route matches this URL
      const res = await axios.get('http://localhost:5000/api/user/medicines'); 
      setMedicines(res.data);
    } catch (error) {
      console.error("Error fetching cabinet:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCabinet();
  }, []);

  // --- DELETE MEDICINE ---
  const handleDelete = async (id, name, e) => {
    e.stopPropagation(); // Prevent opening the modal when clicking delete
    if (!window.confirm(`Are you sure you want to remove ${name}?`)) return;

    try {
      await axios.delete(`http://localhost:5000/api/user/remove/${id}`);
      // Optimistic update: remove from UI immediately
      setMedicines(medicines.filter(med => med._id !== id));
    } catch (error) {
      alert("Error removing item.");
    }
  };

  // --- HELPER: FORMAT DATE ---
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('en-SG', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  // --- HELPER: RENDER LISTS (Re-used from DrugSearch logic) ---
  const renderContent = (content) => {
    if (!content) return "No details available.";
    if (Array.isArray(content)) {
      return <ul style={{paddingLeft:'20px'}}>{content.map((c, i) => <li key={i}>{c}</li>)}</ul>;
    }
    return <p>{content}</p>;
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>💊 My Medicine Cabinet</h1>
      <p style={styles.subHeader}>Manage your saved medications and prescriptions.</p>

      {loading ? (
        <p>Loading your cabinet...</p>
      ) : medicines.length === 0 ? (
        <div style={styles.emptyState}>
          <h3>Your cabinet is empty.</h3>
          <p>Go to "Drugs A-Z" or Search to add medicines here.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {medicines.map((med) => (
            <div key={med._id} style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={{fontSize:'2rem'}}>💊</span>
                {/* DELETE BUTTON */}
                <button 
                  onClick={(e) => handleDelete(med._id, med.brandName, e)}
                  style={styles.deleteBtn}
                  title="Remove from Cabinet"
                >
                  ×
                </button>
              </div>
              
              <h3 style={styles.drugTitle}>{med.brandName}</h3>
              <p style={styles.genericName}>{med.genericName}</p>
              
              <div style={styles.timestamp}>
                Saved on: {formatDate(med.createdAt)}
              </div>

              {/* VIEW DETAILS BUTTON */}
              <button 
                onClick={() => setSelectedDrug(med)}
                style={styles.viewBtn}
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      )}

      {/* --- MODAL FOR VIEWING DETAILS --- */}
      {selectedDrug && (
        <div style={styles.modalOverlay} onClick={() => setSelectedDrug(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button style={styles.closeModalBtn} onClick={() => setSelectedDrug(null)}>×</button>
            
            <h2 style={styles.modalTitle}>{selectedDrug.brandName}</h2>
            <p style={styles.modalSubtitle}>{selectedDrug.genericName}</p>
            
            <div style={styles.scrollArea}>
              {selectedDrug.details ? (
                <>
                  <Section title="Purpose" content={selectedDrug.details.purpose} />
                  <Section title="How to Take" content={selectedDrug.details.dosage} />
                  <Section title="Side Effects" content={selectedDrug.details.side_effects} />
                  <Section title="Warnings" content={selectedDrug.details.warnings} warning />
                  <Section title="Interactions" content={selectedDrug.details.interactions} />
                </>
              ) : (
                <p style={{color: '#666', fontStyle: 'italic'}}>
                  Detailed information is missing for this saved item. 
                  Please delete it and re-add it from the Search page to update the data.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple Sub-component for the Modal Sections
const Section = ({ title, content, warning }) => (
  <div style={{...styles.section, ...(warning ? styles.warningSection : {})}}>
    <h4 style={{...styles.sectionTitle, ...(warning ? styles.warningTitle : {})}}>{title}</h4>
    {Array.isArray(content) ? (
      <ul style={{marginTop:'5px', paddingLeft:'20px'}}>
        {content.map((item, i) => <li key={i} style={{marginBottom:'5px'}}>{item}</li>)}
      </ul>
    ) : (
      <p style={{marginTop:'5px'}}>{content || "No information available."}</p>
    )}
  </div>
);

const styles = {
  container: { maxWidth: '1000px', margin: '0 auto', fontFamily: 'Arial, sans-serif' },
  header: { color: '#104c97', borderBottom: '2px solid #eee', paddingBottom: '15px' },
  subHeader: { color: '#666', marginBottom: '30px' },
  emptyState: { textAlign: 'center', padding: '50px', backgroundColor: '#f9f9f9', borderRadius: '8px' },
  
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' },
  card: { backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', border: '1px solid #eee', position: 'relative', display: 'flex', flexDirection: 'column' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px' },
  drugTitle: { margin: '0 0 5px 0', color: '#333' },
  genericName: { margin: '0 0 15px 0', color: '#777', fontSize: '0.9rem', fontStyle: 'italic' },
  timestamp: { fontSize: '0.8rem', color: '#aaa', marginBottom: '15px', marginTop: 'auto' },
  
  deleteBtn: { background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#ccc', padding: '0 5px' },
  viewBtn: { width: '100%', padding: '10px', backgroundColor: '#eef3fc', color: '#1e5bbd', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: 'background 0.2s' },
  
  // Modal Styles
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { backgroundColor: 'white', width: '90%', maxWidth: '600px', maxHeight: '85vh', borderRadius: '12px', padding: '30px', position: 'relative', display: 'flex', flexDirection: 'column' },
  closeModalBtn: { position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer', color: '#666' },
  modalTitle: { margin: '0 0 5px 0', color: '#104c97', fontFamily: 'Georgia, serif' },
  modalSubtitle: { margin: '0 0 20px 0', color: '#666', fontStyle: 'italic' },
  scrollArea: { overflowY: 'auto', paddingRight: '10px' },
  
  section: { marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #eee' },
  sectionTitle: { margin: '0', color: '#333', fontSize: '1.1rem' },
  warningSection: { backgroundColor: '#fffdf5', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #ffc107' },
  warningTitle: { color: '#856404' }
};

export default MyCabinet;