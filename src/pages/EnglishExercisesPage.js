import React from 'react';
import { useNavigate } from 'react-router-dom';
import './EnglishExercisesPage.css';

const EnglishExercisesPage = () => {
  const navigate = useNavigate();

  return (
    <div className="english-exercises-container">
      <h2 className="english-title">✨ English Exercises ✨</h2>

      <div className="english-buttons">
        <button
          onClick={() => navigate('/english/exercises/audio')}
          className="english-button"
        >
          🎵 Audio Recognition
        </button>

        <button
          onClick={() => navigate('/english/exercises/word-match')}
          className="english-button"
        >
          🧠 Word Match
        </button>

        <button
          onClick={() => navigate('/english/exercises/word-sorting')}
          className="english-button"
        >
          🔤 Word Sorting Game
        </button>
      </div>

      <div className="english-video-wrapper">
        <video autoPlay muted loop className="english-bg-video">
          <source src="/videos/englishexercise.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
};

export default EnglishExercisesPage;
