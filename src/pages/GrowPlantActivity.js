import React, { useState, useEffect } from 'react';
import './GrowPlantActivity.css';
import Confetti from 'react-confetti';
import { useWindowSize } from '@react-hook/window-size';

// Sesleri önceden yükle
const celebrationSound = new Audio('/sounds/success.mp3');
const seedSound        = new Audio('/sounds/seed.mp3');
const waterSound       = new Audio('/sounds/water.mp3');
const sunSound         = new Audio('/sounds/sun.mp3');
[celebrationSound, seedSound, waterSound, sunSound].forEach(s => s.preload = 'auto');

export default function GrowPlantActivity() {
  const [step, setStep] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [width, height] = useWindowSize();

  // Noise dosyası public altında olduğu için PUBLIC_URL kullan
  const noiseUrl = `${process.env.PUBLIC_URL}/noise.png`;

  // Sesleri yükle
  useEffect(() => {
    [celebrationSound, seedSound, waterSound, sunSound].forEach(s => s.load());
  }, []);

  const nextStep = () => {
    if (step >= 3) return;
    if (step === 0) seedSound.play().catch(() => {});
    if (step === 1) waterSound.play().catch(() => {});
    if (step === 2) sunSound.play().catch(() => {});

    const next = step + 1;
    setStep(next);

    if (next === 3) {
      celebrationSound.play().catch(() => {});
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  const resetGame = () => {
    [celebrationSound, seedSound, waterSound, sunSound].forEach(s => {
      s.pause(); s.currentTime = 0;
    });
    setStep(0);
    setShowConfetti(false);
  };

  const getInfoCard = () => {
    if (step === 0) return '🌰 Plants grow from seeds. Every plant begins its life as a seed!';
    if (step === 1) return '💧 Water is essential for plants to grow. Without water, they can’t survive!';
    if (step === 2) return '☀️ Sunlight helps the plant make food. This process is called photosynthesis!';
    return '';
  };

  return (
    <div
      className={`gp-container gp-stage${step}`}
      style={{ '--noise-url': `url(${noiseUrl})` }}
    >
      <h1 className="gp-title">Grow a Plant! 🌱</h1>
      <div className="gp-stepper">
        {['Seed','Water','Sun','Bloom'].map((label, idx) => (
          <React.Fragment key={label}>
            <div className={`gp-step ${step===idx?'active':''}`}>
              <div className="gp-step-dot" />
              <div className="gp-step-label">{label}</div>
            </div>
            {idx < 3 && <div className={`gp-step-bar ${step>idx?'active':''}`} />}
          </React.Fragment>
        ))}
      </div>
      {step < 3 && (
        <div className="gp-stage-container">
          <div className={`gp-butterfly-wrapper ${step%2===0?'gp-left':'gp-right'}`}>
            <div className="gp-mascot">🦋</div>
            <div className="gp-speech-bubble"><p>{getInfoCard()}</p></div>
          </div>
          <div className="gp-plant-stage">
            <div className={`gp-pot ${step===1?'gp-seed':''} ${step===2?'gp-sprout':''}`} />
            <div className="gp-button-wrapper">
              <button className="gp-action-button" onClick={nextStep}>
                {step===0?'Plant Seed':step===1?'Water Seed':'Give Sunlight'}
              </button>
            </div>
          </div>
        </div>
      )}
      {step===3 && (
        <>
          {showConfetti && (
            <Confetti className="gp-confetti" width={width} height={height+200} recycle={false} numberOfPieces={400} />
          )}
          <div className="gp-stage-container">
            <div className="gp-plant-stage gp-bloom-stage">
              <div className="gp-pot gp-grown" />
            </div>
          </div>
          <h2 className="gp-congrats">Congratulations! Your plant has fully grown! 🌻</h2>
          <div className="gp-end-buttons">
            <button className="gp-action-button" onClick={resetGame}>🔁 Play Again</button>
            <button className="gp-action-button" onClick={()=>window.location.href='/module/science/activities'}>🏠 Go to Activities</button>
          </div>
        </>
      )}
    </div>
  );
}