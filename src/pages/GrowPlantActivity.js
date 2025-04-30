import React, { useState, useEffect } from 'react';
import './GrowPlantActivity.css';
import Confetti from 'react-confetti';
import { useWindowSize } from '@react-hook/window-size';

const celebrationSound = new Audio('/sounds/success.mp3');

function GrowPlantActivity() {
  const [step, setStep] = useState(0);
  const [width, height] = useWindowSize();

  useEffect(() => {
    if (step === 3) {
      celebrationSound.currentTime = 0;
      celebrationSound.play();
    }
  }, [step]);

  const nextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const resetGame = () => {
    setStep(0);
    celebrationSound.pause();
    celebrationSound.currentTime = 0;
  };

  const getStageClass = () => {
    switch (step) {
      case 0:
        return 'stage0';
      case 1:
        return 'stage1';
      case 2:
        return 'stage2';
      case 3:
        return 'stage3';
      default:
        return '';
    }
  };

  const getInfoCard = () => {
    switch (step) {
      case 0:
        return '🌰 Plants grow from seeds. Every plant begins its life as a seed!';
      case 1:
        return '💧 Water is essential for plants to grow. Without water, they can\'t survive!';
      case 2:
        return '☀️ Sunlight helps the plant make food. This process is called photosynthesis!';
      default:
        return '';
    }
  };

  return (
    <div className={`grow-plant-container ${getStageClass()}`} style={{ height: '100vh', marginTop: '-64px' }}>
      <h1 style={{ paddingTop: '64px' }}>Grow a Plant! 🌱</h1>

      <div className="plant-stage">
        {step === 0 && (
          <div>
            <div className="pot"></div>
            <p>Click the button to plant a seed! 🌰</p>
          </div>
        )}
        {step === 1 && (
          <div>
            <div className="pot seed"></div>
            <p>Water your seed! 💧</p>
          </div>
        )}
        {step === 2 && (
          <div>
            <div className="pot sprout"></div>
            <p>Give sunlight to help it grow! ☀️</p>
          </div>
        )}
        {step === 3 && (
          <div style={{ position: 'relative', zIndex: 2 }}>
            <Confetti width={width} height={height + 200} recycle={false} numberOfPieces={400} style={{ position: 'fixed', top: 0, left: 0, zIndex: 1 }} />
            <div className="pot grown"></div>
            <h2>Congratulations! Your plant has fully grown! 🌻</h2>

            <div className="end-buttons">
              <button className="action-button" onClick={resetGame}>🔁 Try Again</button>
              <button className="action-button" onClick={() => window.location.href = "/dashboard"}>🏠 Go to Home</button>
            </div>
          </div>
        )}
      </div>

      {step < 3 && (
        <div className={`butterfly-wrapper ${step % 2 === 0 ? 'left' : 'right'}`}>
          <div style={{ fontSize: '40px', marginRight: '10px' }}>🦋</div>
          <div className="speech-bubble">
            <p>{getInfoCard()}</p>
          </div>
        </div>
      )}

      {step < 3 && (
        <div style={{ marginBottom: '40px' }}>
          <button className="action-button" onClick={nextStep}>
            {step === 0 ? 'Plant Seed' : step === 1 ? 'Water Seed' : 'Give Sunlight'}
          </button>
        </div>
      )}
    </div>
  );
}

export default GrowPlantActivity;

