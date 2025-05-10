import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ScienceExercisesPage.css';

const facts = [
  "Did you know? Water expands when it freezes!",
  "Did you know? The Earth orbits the Sun at about 107,000 km/h!",
  "Did you know? Sound travels faster in water than in air!",
  "Did you know? A magnet has two poles: north and south!",
  "Did you know? Clouds are made of tiny water droplets or ice crystals!",
  "Did you know? Not all metals are magnetic!",
];

const ScienceExercisesPage = () => {
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
    <div className="science-exercises-container">
      <div className="science-icons-floating">
        <span className="science-float-item">🧪</span>
        <span className="science-float-item">🧲</span>
        <span className="science-float-item">🌡️</span>
        <span className="science-float-item">💧</span>
        <span className="science-float-item">🧬</span>
      </div>

      <h2 className="science-title bounce-glow-title">
  <span className="emoji">🔬</span>{" "}
  {"Science Exercises".split("").map((char, i) =>
    char === " " ? (
      <span key={i} className="gap">&nbsp;</span>
    ) : (
      <span key={i} style={{ animationDelay: `${i * 0.05}s` }}>{char}</span>
    )
  )}
</h2>




      <div className="science-buttons">
        <button className="science-button" onClick={() => navigate('/science/exercises/weather-challenge')}>
          🌡️ Weather Thermometer Challenge
        </button>
        <button className="science-button" onClick={() => navigate('/science/exercises/float-sink')}>
          🌊 Float or Sink?
        </button>
        <button className="science-button" onClick={() => navigate('/science/exercises/magnetic-or-not')}>
          🧲 Magnetic or Not?
        </button>
      </div>

      <div className="science-videos-section">
        <div className="science-video-box">
          <video autoPlay muted loop className="science-video">
            <source src="/videos/scienceexercise1.mp4" type="video/mp4" />
          </video>
          <p className="science-video-caption">💧 Water & Weather</p>
        </div>
        <div className="science-video-box">
          <video autoPlay muted loop className="science-video">
            <source src="/videos/scienceexercise2.mp4" type="video/mp4" />
          </video>
          <p className="science-video-caption">🧲 Magnetism</p>
        </div>
        <div className="science-video-box">
          <video autoPlay muted loop className="science-video">
            <source src="/videos/scienceexercise.mp4" type="video/mp4" />
          </video>
          <p className="science-video-caption">🌡️ Temperature Fun</p>
        </div>
      </div>

      {showFact && (
        <div className="science-did-you-know-bubble">{currentFact}</div>
      )}
    </div>
  );
};

export default ScienceExercisesPage;
