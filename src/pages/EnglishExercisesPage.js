import React from 'react';
import { useNavigate } from 'react-router-dom';
import './EnglishExercisesPage.css';

const EnglishExercisesPage = () => {
  const navigate = useNavigate();

  return (
    <div className="exercises-page-container">
      <h2 className="exercises-title">English Exercises</h2>

      <div className="exercise-buttons-grid">
        <button
          onClick={() => navigate('/english/exercises/audio')}
          className="exercise-button"
        >
          🎵 Audio Recognition
        </button>


        <button
          onClick={() => navigate('/english/exercises/word-match')}
          className="exercise-button"
        >
          🧠 Word Match
        </button>

        <button
          onClick={() => navigate('/english/exercises/word-sorting')}
          className="exercise-button"
        >
          🔤 Word Sorting Game
        </button>

        {/* Yeni egzersiz eklemek istersen buraya */}
        {/* 
        <button
          onClick={() => navigate('/english/exercises/word-match')}
          className="exercise-button"
        >
          🧠 Word Match
        </button>
        */}
      </div>
    </div>
  );
};

export default EnglishExercisesPage;
