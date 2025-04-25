// MathExercisesPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './MathExercisesPage.css';

const MathExercisesPage = () => {
  const navigate = useNavigate();

  return (
    <div className="math-exercises-container">
      <h2 className="math-exercises-title">Math Exercises</h2>

      <div className="exercise-buttons">
        <button
          className="exercise-button"
          onClick={() => navigate('/math/exercises/dice')}
        >
          🎲 Dice Game
        </button>

        <button
          className="exercise-button"
          onClick={() => navigate('/math/exercises/bar-graph')}
        >
          📊 Bar Graph Reading
        </button>

        <button
          className="exercise-button"
          onClick={() => navigate('/math/exercises/even-or-odd')}
        >
          🔢 Even or Odd?
        </button>
      </div>
    </div>
  );
};

export default MathExercisesPage;
