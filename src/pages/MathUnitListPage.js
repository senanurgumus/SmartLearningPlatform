import React, { useEffect, useState } from 'react';
import mathQuiz from '../data/math_quiz.json';
import { Link } from 'react-router-dom';
import './MathUnitListPage.css';

function MathUnitListPage() {
  const [units, setUnits] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setUnits(Object.keys(mathQuiz));
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const filteredUnits = units.filter(unit =>
    unit.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="math-glass-container">
      <div className="math-header">
        <h2 className="glass-title">🧠 Math Quizzes</h2>
        <p className="glass-subtitle">Select a unit and test your skills!</p>

        <input
          type="text"
          placeholder="🔍 Search units..."
          className="unit-search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="glass-grid">
        {filteredUnits.map((unit) => (
          <Link key={unit} to={`/module/math/quiz/${unit}`} className="glass-card">
            <div className="glass-card-icon">📐</div>
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

export default MathUnitListPage;
