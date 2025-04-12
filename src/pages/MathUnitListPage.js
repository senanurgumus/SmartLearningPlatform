import React, { useEffect, useState } from 'react';
import mathQuiz from '../data/math_quiz.json';
import { Link } from 'react-router-dom';

function MathUnitListPage() {
  const [units, setUnits] = useState([]);

  useEffect(() => {
    setUnits(Object.keys(mathQuiz));
  }, []);

  return (
    <div>
      <h2>Select a Math Unit</h2>
      {units.map((unit) => (
        <Link key={unit} to={`/module/math/quiz/${unit}`}>
          <button style={{ margin: '10px' }}>{unit.replace(/_/g, ' ')}</button>
        </Link>
      ))}
    </div>
  );
}

export default MathUnitListPage;
