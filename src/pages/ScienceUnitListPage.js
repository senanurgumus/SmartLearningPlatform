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
      <h2 className="science-unit-title">Select a Science Unit</h2>
      <div className="unit-buttons-grid">
        {units.map((unit) => (
          <Link key={unit} to={`/module/science/quiz/${unit}`}>
            <button className="unit-button">
              {unit.replace(/_/g, ' ')}
            </button>
          </Link>
        ))}
      </div>
    </div>
  );
  
}

export default ScienceUnitListPage;
