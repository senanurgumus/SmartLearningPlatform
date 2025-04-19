
import React, { useState } from 'react';
import './ShakeTest.css';

function ShakeTest() {
  const [shake, setShake] = useState(false);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500); // animasyonu temizle
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <div className={`test-box ${shake ? 'shake' : ''}`}>
        🔴 Kutu
      </div>
      <button onClick={triggerShake} style={{ marginTop: '20px' }}>
        Titret!
      </button>
    </div>
  );
}

export default ShakeTest;
