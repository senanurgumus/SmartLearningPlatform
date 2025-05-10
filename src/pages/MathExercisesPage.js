import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MathExercisesPage.css';

const facts = [
  "Did you know? Zero is the only number that can't be represented in Roman numerals!",
  "Did you know? A triangle's angles always add up to 180 degrees!",
  "Did you know? 'Googol' is 1 followed by 100 zeros!",
  "Did you know? The equal sign (=) was invented in 1557!",
  "Did you know? There are infinitely many prime numbers!",
  "Did you know? The word 'geometry' means 'earth measurement' in Greek!",
];

const MathExercisesPage = () => {
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
      }, 5000);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="math-exercises-container">
      <div className="math-icons-floating">
        <span className="math-float-item">➕</span>
        <span className="math-float-item">🧮</span>
        <span className="math-float-item">➖</span>
        <span className="math-float-item">📏</span>
        <span className="math-float-item">📐</span>
      </div>

      <h2 className="math-exercises-title">🧠 Math Exercises</h2>

      <div className="exercise-buttons">
        <button className="exercise-button" onClick={() => navigate('/math/exercises/dice')}>
          🎲 Dice Game
        </button>
        <button className="exercise-button" onClick={() => navigate('/math/exercises/bar-graph')}>
          📊 Bar Graph Reading
        </button>
        <button className="exercise-button" onClick={() => navigate('/math/exercises/even-or-odd')}>
          🔢 Even or Odd?
        </button>
      </div>

      <div className="math-videos-section">
        <div className="math-video-box">
          <video autoPlay muted loop className="math-video">
            <source src="/videos/mathexercise1.mp4" type="video/mp4" />
          </video>
          <p className="math-video-caption">📐 Geometry Fun</p>
        </div>
        <div className="math-video-box">
          <video autoPlay muted loop className="math-video">
            <source src="/videos/mathexercise2.mp4" type="video/mp4" />
          </video>
          <p className="math-video-caption">🧮 Calculations</p>
        </div>
        <div className="math-video-box">
          <video autoPlay muted loop className="math-video">
            <source src="/videos/mathexercise.mp4" type="video/mp4" />
          </video>
          <p className="math-video-caption">🎲 Probability Play</p>
        </div>
      </div>

      {showFact && <div className="math-did-you-know-bubble">{currentFact}</div>}
    </div>
  );
};

export default MathExercisesPage;
