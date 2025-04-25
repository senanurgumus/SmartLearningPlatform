import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ScienceExercisesPage.css'; // CSS dosyasını ayrı tutuyoruz

const ScienceExercisesPage = () => {
  const navigate = useNavigate();

  return (
    <div className="exercises-page-container">
      <h2 className="exercises-title">Science Exercises</h2>

      <div className="exercise-buttons-grid">
        <button
          onClick={() => navigate('/science/exercises/weather-challenge')}
          className="exercise-button"
        >
          🌡️ Weather Thermometer Challenge

        </button>

        <button
        onClick={() => navigate('/science/exercises/float-sink')}
        className="exercise-button"
      >
        🌊 Float or Sink?
      </button>


      <button
      onClick={() => navigate('/science/exercises/magnetic-or-not')}
      className="exercise-button"
      >
        🧲 Magnetic or Not?
      </button>

      </div>
    </div>
  );
};

export default ScienceExercisesPage;
