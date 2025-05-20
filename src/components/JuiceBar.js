// components/JuiceBar.js
import React from 'react';
import './JuiceBar.css';

const JuiceBar = ({ message }) => {
  return (
    <div className="juice-bar-overlay">
      <div className="juice-bar-popup">
        <div className="juice-emoji">🧃</div>
        <p className="juice-text">{message}</p>
      </div>
    </div>
  );
};

export default JuiceBar;
