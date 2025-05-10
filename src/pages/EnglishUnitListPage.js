import React, { useEffect, useState } from 'react';
import englishQuiz from '../data/english_quiz.json';
import { Link } from 'react-router-dom';
import './EnglishUnitListPage.css';

function EnglishUnitListPage() {
  const [units, setUnits] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setUnits(Object.keys(englishQuiz));
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const filteredUnits = units.filter(unit =>
    unit.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="english-glass-container">
      <div className="english-header">
        <h2 className="glass-title">📘 English Quizzes</h2>
        <p className="glass-subtitle">Sharpen your language skills by picking a unit!</p>

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
            to={`/module/english/quiz/${unit}`}
            className="glass-card animated-card"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="glass-card-icon">📝</div>
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

export default EnglishUnitListPage;
