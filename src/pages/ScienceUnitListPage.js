import React, { useEffect, useState } from 'react';
import scienceQuiz from '../data/science_quiz.json';
import { Link } from 'react-router-dom';
import './ScienceUnitListPage.css';

function ScienceUnitListPage() {
  const [units, setUnits] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setUnits(Object.keys(scienceQuiz));
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const filteredUnits = units.filter(unit =>
    unit.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="science-glass-container">
      <div className="science-header">
        <h2 className="glass-title">🔬 Science Quizzes</h2>
        <p className="glass-subtitle">Explore the wonders of science by selecting a unit!</p>

        <input
          type="text"
          placeholder="🔍 Search units..."
          className="unit-search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="glass-grid">
        {filteredUnits.map((unit, index) => (
          <Link
            key={unit}
            to={`/module/science/quiz/${unit}`}
            className="glass-card animated-card"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="glass-card-icon">🧪</div>
            <div className="glass-card-title">{unit.replace(/_/g, ' ')}</div>
            <div className="glass-card-sub">Start Quiz</div>
          </Link>
        ))}
        {filteredUnits.length === 0 && (
          <p className="no-results">No units found.</p>
        )}
      </div>
    </div>
  );
}

export default ScienceUnitListPage;
