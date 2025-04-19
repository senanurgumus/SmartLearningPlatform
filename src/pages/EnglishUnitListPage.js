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
      <h2 className="english-unit-title">Select an English Unit</h2>
      <div className="unit-buttons-grid">
        {units.map((unit) => (
          <Link key={unit} to={`/module/english/quiz/${unit}`}>
            <button className="unit-button">
              {unit.replace(/_/g, ' ')}
            </button>
          </Link>
        ))}
      </div>
    </div>
  );
  
}

export default EnglishUnitListPage;
