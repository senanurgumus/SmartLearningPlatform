// GrowPlantActivity.js
import React, { useState, useEffect } from 'react';
import './GrowPlantActivity.css';
import Confetti from 'react-confetti';
import { useWindowSize } from '@react-hook/window-size';

// Preload sounds
const celebrationSound = new Audio('/sounds/success.mp3');
const seedSound        = new Audio('/sounds/seed.mp3');
const waterSound       = new Audio('/sounds/water.mp3');
const sunSound         = new Audio('/sounds/sun.mp3');
[celebrationSound, seedSound, waterSound, sunSound].forEach(s => {
  s.preload = 'auto';
});

function GrowPlantActivity() {
  const [step, setStep] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [width, height] = useWindowSize();

  // Pre-load audio buffers on mount
  useEffect(() => {
    [celebrationSound, seedSound, waterSound, sunSound].forEach(s => s.load());
  }, []);

  const nextStep = () => {
    if (step >= 4) return;

    // play appropriate sound on user action
    if (step === 0) {
      seedSound.currentTime = 0;
      seedSound.play().catch(() => {});
    } else if (step === 1) {
      waterSound.currentTime = 0;
      waterSound.play().catch(() => {});
    } else if (step === 2) {
      sunSound.currentTime = 0;
      sunSound.play().catch(() => {});
    } else if (step === 3) {
      celebrationSound.currentTime = 0;
      celebrationSound.play().catch(() => {});
    }

    const next = step + 1;
    setStep(next);

    // show confetti for a limited time on final step
    if (next === 4) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  const resetGame = () => {
    [celebrationSound, seedSound, waterSound, sunSound].forEach(s => {
      s.pause();
      s.currentTime = 0;
    });
    setStep(0);
    setShowConfetti(false);
  };

  const getInfoCard = () => {
    switch (step) {
      case 0:
        return '🌰 Plants grow from seeds. Every plant begins its life as a seed!';
      case 1:
        return '💧 Water is essential for plants to grow. Without water, they can’t survive!';
      case 2:
        return '☀️ Sunlight helps the plant make food. This process is called photosynthesis!';
      default:
        return '';
    }
  };

  return (
    <div className={`gp-container gp-stage${step}`}>      
      <h1 className="gp-title">Grow a Plant! 🌱</h1>

      {/* Progress Stepper */}
      {step < 4 && (
        <div className="gp-stepper">
          {['Seed', 'Water', 'Sun', 'Bloom'].map((label, index) => (
            <div key={index} className={`gp-step ${step === index ? 'active' : ''}`}>
              <div className="gp-step-dot" />
              <div className="gp-step-label">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Interactive Stages */}
      {step < 3 && (
        <div className="gp-stage-container">
          <div className={`gp-butterfly-wrapper ${step % 2 === 0 ? 'gp-left' : 'gp-right'}`}>
            <div className="gp-mascot">🦋</div>
            <div className="gp-speech-bubble">
              <p>{getInfoCard()}</p>
            </div>
          </div>

          <div className="gp-plant-stage">
            <div className={`gp-pot ${step === 1 ? 'gp-seed' : ''} ${step === 2 ? 'gp-sprout' : ''}`} />
            <div className="gp-button-wrapper">
              <button className="gp-action-button" onClick={nextStep}>
                {step === 0 && 'Plant Seed'}
                {step === 1 && 'Water Seed'}
                {step === 2 && 'Give Sunlight'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bloom Stage */}
      {step === 3 && (
        <div className="gp-stage-container">
          <div className="gp-butterfly-wrapper gp-left">
            <div className="gp-mascot">🦋</div>
            <div className="gp-speech-bubble">
              <p>🌻 Look! Your flower has bloomed!</p>
            </div>
          </div>

        <div className="gp-plant-stage gp-bloom-stage">
          <div className="gp-pot gp-grown" />
          <div className="gp-button-wrapper">
            <button className="gp-action-button" onClick={nextStep}>
              Celebrate!
            </button>
          </div>
          </div>
        </div>  
      )}

      {/* Celebration & End Buttons */}
      {step === 4 && (
        <>
          {showConfetti && (
            <Confetti
              className="gp-confetti"
              width={width}
              height={height + 200}
              recycle={false}
              numberOfPieces={400}
            />
          )}
          <h2 className="gp-congrats">Congratulations! Your plant has fully grown! 🌻</h2>
          <div className="gp-end-buttons">
            <button className="gp-action-button" onClick={resetGame}>
              🔁 Play Again
            </button>
            <button
              className="gp-action-button"
              onClick={() => (window.location.href = '/module/science/activities')}
            >
              🏠 Go to Activities
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default GrowPlantActivity;