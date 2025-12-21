import React from 'react';

function Disclaimer() {
  return (
    <div className="disclaimer" style={{ fontSize: '1rem', color: '#b71c1c', margin: '1rem auto', maxWidth: 600, textAlign: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(12px)', padding: '1rem', borderRadius: '8px' }}>
      <strong>Disclaimer:</strong> This AI-powered tool is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment.
    </div>
  );
}

export default Disclaimer; 