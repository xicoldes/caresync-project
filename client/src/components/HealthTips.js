import React, { useState } from 'react';

const healthData = [
  {
    id: 'bp',
    title: '❤️ High Blood Pressure',
    summary: 'Hypertension management',
    tips: [
      "Reduce Sodium: Limit salt intake to under 2,300mg (1 teaspoon) per day.",
      "Move More: Aim for 30 minutes of walking or swimming 5 days a week.",
      "DASH Diet: Eat more fruits, vegetables, and whole grains.",
      "Limit Caffeine: Coffee can temporarily spike blood pressure."
    ],
    color: '#ffebee', // Light Red
    icon: '🩺'
  },
  {
    id: 'eczema',
    title: '💧 Eczema / Skin Care',
    summary: 'Managing dry, itchy skin',
    tips: [
      "Moisturize Daily: Apply cream within 3 minutes of showering to lock in water.",
      "Warm, Not Hot: Hot water strips natural oils. Use lukewarm water for showers.",
      "Fragrance-Free: Use soaps and laundry detergents labeled 'hypoallergenic'.",
      "Don't Scratch: Trim nails short to prevent skin damage."
    ],
    color: '#e3f2fd', // Light Blue
    icon: '🧴'
  },
  {
    id: 'eyes',
    title: '👁️ Dry Eyes',
    summary: 'Relief for screen users',
    tips: [
      "20-20-20 Rule: Every 20 mins, look at something 20 feet away for 20 seconds.",
      "Blink More: We blink 66% less when using screens. Consciously blink often.",
      "Humidify: Use a humidifier in your room if the air is dry.",
      "Screen Position: Position your monitor slightly below eye level."
    ],
    color: '#fff3e0', // Light Orange
    icon: '👓'
  },
  {
    id: 'sleep',
    title: '💤 Sleep Hygiene',
    summary: 'Better rest for recovery',
    tips: [
      "Consistent Schedule: Go to bed and wake up at the same time every day.",
      "Darkness: Your room should be pitch black. Use blackout curtains.",
      "No Screens: Avoid phones/tablets 1 hour before bed (blue light wakes you up)."
    ],
    color: '#f3e5f5', // Light Purple
    icon: '🌙'
  }
];

function HealthTips() {
  const [selected, setSelected] = useState(null);

  return (
    <div style={styles.container}>
      <h2>🍀 Health & Wellness Guide</h2>
      <p>Select a topic to view management tips.</p>

      {/* The Grid of Buttons */}
      <div style={styles.grid}>
        {healthData.map((item) => (
          <div 
            key={item.id} 
            style={{...styles.card, backgroundColor: selected === item ? '#333' : item.color, color: selected === item ? '#fff' : '#000'}}
            onClick={() => setSelected(item)}
          >
            <span style={{fontSize: '2rem', display: 'block'}}>{item.icon}</span>
            <h3 style={{fontSize: '1.1rem', margin: '10px 0'}}>{item.title}</h3>
            <p style={{fontSize: '0.9rem', opacity: 0.8}}>{item.summary}</p>
          </div>
        ))}
      </div>

      {/* The Detail View (Appears when clicked) */}
      {selected && (
        <div style={styles.detailBox}>
          <div style={styles.detailHeader}>
            <h3>{selected.title} Tips</h3>
            <button onClick={() => setSelected(null)} style={styles.closeBtn}>Close</button>
          </div>
          <ul>
            {selected.tips.map((tip, index) => (
              <li key={index} style={styles.listItem}>{tip}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '40px auto',
    padding: '20px',
    textAlign: 'center'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', // Responsive Grid
    gap: '15px',
    marginTop: '20px'
  },
  card: {
    padding: '20px',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'transform 0.2s',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
  },
  detailBox: {
    marginTop: '30px',
    padding: '25px',
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '2px solid #eee',
    textAlign: 'left',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    animation: 'fadeIn 0.3s ease-in'
  },
  detailHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
    borderBottom: '1px solid #eee',
    paddingBottom: '10px'
  },
  closeBtn: {
    padding: '5px 15px',
    background: '#ff5252',
    color: 'white',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer'
  },
  listItem: {
    marginBottom: '10px',
    fontSize: '1.1rem',
    lineHeight: '1.5'
  }
};

export default HealthTips;