import React, { useEffect, useState } from 'react';
import mathQuiz from '../data/math_quiz.json';
import { Link } from 'react-router-dom';
import './MathUnitListPage.css';

function MathUnitListPage() {
  const [units, setUnits] = useState([]);

  useEffect(() => {
    setUnits(Object.keys(mathQuiz));
  }, []);

  return (
    <div className="math-unit-container">
      <h2 className="math-unit-title">🧮 Choose a Math Unit</h2>
      <p className="math-unit-subtitle">Sharpen your skills by picking a quiz below!</p>

      <div className="unit-buttons-grid">
        {units.map((unit) => (
          <Link key={unit} to={`/module/math/quiz/${unit}`} className="unit-card">
            <div className="unit-icon">📐</div>
            <div className="unit-name">{unit.replace(/_/g, ' ')}</div>
            <div className="unit-hint">Start Quiz</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default MathUnitListPage;
