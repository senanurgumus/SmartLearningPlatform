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
      <h2 className="math-unit-title">Select a Math Unit</h2>
      <div className="unit-buttons-grid">
        {units.map((unit) => (
          <Link key={unit} to={`/module/math/quiz/${unit}`}>
            <button className="unit-button">
              {unit.replace(/_/g, ' ')}
            </button>
          </Link>
        ))}
      </div>
    </div>
  );
  
}

export default MathUnitListPage;
