import React, { useEffect, useState } from 'react';
import scienceQuiz from '../data/science_quiz.json';
import { Link } from 'react-router-dom';
import './ScienceUnitListPage.css';

function ScienceUnitListPage() {
  const [units, setUnits] = useState([]);

  useEffect(() => {
    setUnits(Object.keys(scienceQuiz));
  }, []);

  return (
    <div className="science-unit-container">
      <h2 className="science-unit-title">🔬 Choose a Science Unit</h2>
      <p className="science-unit-subtitle">Explore the wonders of science by starting a quiz!</p>

      <div className="unit-buttons-grid">
        {units.map((unit) => (
          <Link key={unit} to={`/module/science/quiz/${unit}`} className="unit-card">
            <div className="unit-icon">🧪</div>
            <div className="unit-name">{unit.replace(/_/g, ' ')}</div>
            <div className="unit-hint">Start Quiz</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default ScienceUnitListPage;
