import React, { useEffect, useState } from 'react';
import englishQuiz from '../data/english_quiz.json';
import { Link } from 'react-router-dom';
import './EnglishUnitListPage.css';

function EnglishUnitListPage() {
  const [units, setUnits] = useState([]);

  useEffect(() => {
    setUnits(Object.keys(englishQuiz));
  }, []);

  return (
    <div className="english-unit-container">
      <h2 className="english-unit-title">📘 Choose a English Unit</h2>
      <p className="english-unit-subtitle">Enhance your English skills by selecting a unit below!</p>
      
      <div className="unit-buttons-grid">
        {units.map((unit) => (
          <Link key={unit} to={`/module/english/quiz/${unit}`} className="unit-card">
            <div className="unit-icon">📝</div>
            <div className="unit-name">{unit.replace(/_/g, ' ')}</div>
            <div className="unit-hint">Start Quiz</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default EnglishUnitListPage;
