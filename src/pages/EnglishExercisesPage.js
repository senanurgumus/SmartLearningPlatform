import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './EnglishExercisesPage.css';

const facts = [
  "Did you know? 'Queue' has 4 silent letters in a row!",
  "Did you know? The dot over the letter 'i' is called a 'tittle'!",
  "Did you know? 'Rhythm' is the longest word without a vowel!",
  "Did you know? 'Bookkeeper' has three double letters in a row!",
  "Did you know? The word 'alphabet' comes from 'alpha' and 'beta'!",
  "Did you know? 'Dreamt' is the only English word ending in 'mt'!",
];

const EnglishExercisesPage = () => {
  const navigate = useNavigate();
  const [currentFact, setCurrentFact] = useState('');
  const [showFact, setShowFact] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });

    const interval = setInterval(() => {
      const randomFact = facts[Math.floor(Math.random() * facts.length)];
      setCurrentFact(randomFact);
      setShowFact(true);

      setTimeout(() => {
        setShowFact(false);
      }, 5000); // 5 saniye sonra kaybol
    }, 10000); // 10 saniyede bir

    return () => clearInterval(interval);
  }, []);

  const handleClick = (path) => navigate(path);

  return (
    <div className="english-exercises-container">
      <div className="floating-icons">
        <span className="float-item">⭐</span>
        <span className="float-item">📚</span>
        <span className="float-item">🎈</span>
        <span className="float-item">💫</span>
        <span className="float-item">✏️</span>
      </div>

      <h2 className="english-title animate-title">✨ English Exercises ✨</h2>

      <div className="english-buttons fade-in">
        <button onClick={() => handleClick('/english/exercises/audio')} className="english-button">🎵 Audio Recognition</button>
        <button onClick={() => handleClick('/english/exercises/word-match')} className="english-button">🧠 Word Match</button>
        <button onClick={() => handleClick('/english/exercises/word-sorting')} className="english-button">🔤 Word Sorting Game</button>
      </div>

      <div className="english-videos scale-up">
        <div className="english-video-box">
          <video autoPlay muted loop className="english-video"><source src="/videos/englishexercise1.mp4" type="video/mp4" /></video>
          <p className="video-caption">📖 Learn by Reading</p>
        </div>
        <div className="english-video-box">
          <video autoPlay muted loop className="english-video"><source src="/videos/englishexercise2.mp4" type="video/mp4" /></video>
          <p className="video-caption">🖥️ Practice with Technology</p>
        </div>
        <div className="english-video-box">
          <video autoPlay muted loop className="english-video"><source src="/videos/englishexercise.mp4" type="video/mp4" /></video>
          <p className="video-caption">💡 Think and Explore</p>
        </div>
      </div>

      {showFact && (
        <div className="did-you-know-bubble">
          {currentFact}
        </div>
      )}
    </div>
  );
};

export default EnglishExercisesPage;
