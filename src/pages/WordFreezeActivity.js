import React, { useState } from 'react';
import './WordFreezeActivity.css';
import Confetti from 'react-confetti';
import { useWindowSize } from '@react-hook/window-size';

const wordLevels = {
    level1: [
        { target: 'Big', options: ['Huge', 'Tiny', 'Fast'], correct: 'Huge' },
        { target: 'Happy', options: ['Joyful', 'Sad', 'Loud'], correct: 'Joyful' },
        { target: 'Cold', options: ['Hot', 'Freezing', 'Warm'], correct: 'Freezing' },
        { target: 'Quick', options: ['Slow', 'Rapid', 'Small'], correct: 'Rapid' },
        { target: 'Angry', options: ['Mad', 'Glad', 'Bright'], correct: 'Mad' },
        { target: 'Fast', options: ['Quick', 'Slow', 'Short'], correct: 'Quick' },
        { target: 'Strong', options: ['Weak', 'Powerful', 'Small'], correct: 'Powerful' },
        { target: 'Beautiful', options: ['Ugly', 'Pretty', 'Mean'], correct: 'Pretty' },
        { target: 'Smart', options: ['Intelligent', 'Slow', 'Fast'], correct: 'Intelligent' },
        { target: 'Funny', options: ['Humorous', 'Boring', 'Serious'], correct: 'Humorous' }
    ],
    level2: [
        { target: 'Hot', options: ['Cold', 'Warm', 'Boiling'], correct: 'Cold' },
        { target: 'Tall', options: ['High', 'Short', 'Big'], correct: 'Short' },
        { target: 'Early', options: ['Late', 'Soon', 'Fast'], correct: 'Late' },
        { target: 'Full', options: ['Empty', 'Clean', 'Open'], correct: 'Empty' },
        { target: 'Young', options: ['Old', 'New', 'Fresh'], correct: 'Old' },
        { target: 'Day', options: ['Night', 'Morning', 'Sun'], correct: 'Night' },
        { target: 'Up', options: ['Above', 'Down', 'Back'], correct: 'Down' },
        { target: 'Happy', options: ['Sad', 'Glad', 'Joyful'], correct: 'Sad' },
        { target: 'Open', options: ['Shut', 'Wide', 'Unlocked'], correct: 'Shut' },
        { target: 'Clean', options: ['Dirty', 'Neat', 'Clear'], correct: 'Dirty' }
    ]
};

function WordFreezeActivity() {
  const [currentLevel, setCurrentLevel] = useState('level1');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [unfrozen, setUnfrozen] = useState(false);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [showWrong, setShowWrong] = useState(false);
  const [width, height] = useWindowSize();

  const wordList = wordLevels[currentLevel];
  const current = wordList[currentIndex];

  const playSound = (src) => {
    const audio = new Audio(src);
    audio.play();
  };

  const handleChoice = (choice) => {
    if (unfrozen) return;

    if (choice === current.correct) {
      playSound('/sounds/ice-break.mp3');
      setUnfrozen(true);
      setScore(score + 1);
      setShowWrong(false);
      setTimeout(() => {
        if (currentIndex + 1 < wordList.length) {
          setCurrentIndex(currentIndex + 1);
          setUnfrozen(false);
        } else {
          setShowResult(true);
        }
      }, 1000);
    } else {
      playSound('/sounds/wrong.mp3');
      setShowWrong(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setScore(0);
    setUnfrozen(false);
    setShowResult(false);
    setShowWrong(false);
  };

  const handleLevelChange = (e) => {
    setCurrentLevel(e.target.value);
    setCurrentIndex(0);
    setScore(0);
    setUnfrozen(false);
    setShowResult(false);
    setShowWrong(false);
  };

  const handleNextLevel = () => {
    const levels = Object.keys(wordLevels);
    const currentIdx = levels.indexOf(currentLevel);
    const next = levels[currentIdx + 1];
    if (next) {
      setCurrentLevel(next);
      setCurrentIndex(0);
      setScore(0);
      setUnfrozen(false);
      setShowResult(false);
      setShowWrong(false);
    }
  };

  return (
    <div
      className="freeze-container"
      style={{
        backgroundImage: 'url("/images/bg-ice-page.png")',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center',
        minHeight: '100vh'
      }}
    >
      <div className="level-select">
        <label>Choose Level: </label>
        <select value={currentLevel} onChange={handleLevelChange}>
          {Object.keys(wordLevels).map((levelKey, idx) => (
            <option key={idx} value={levelKey}>
              {`Level ${idx + 1}`}
            </option>
          ))}
        </select>
      </div>

      {currentLevel === 'level1' && <h3 className="mode-info">Which word means the same?</h3>}
      {currentLevel === 'level2' && <h3 className="mode-info">Which word means the opposite?</h3>}

      {!showResult ? (
        <div className="freeze-card">
          <div
            className={`ice-word ${unfrozen ? 'unfrozen' : ''}`}
            style={!unfrozen ? { backgroundImage: 'url("/images/ice-bg.png")' } : {}}
          >
            {current.target}
          </div>

          <div className="choices">
            {current.options.map((opt, idx) => (
              <button key={idx} onClick={() => handleChoice(opt)} className="choice-btn">
                {opt}
              </button>
            ))}
          </div>

          {showWrong && <p className="wrong-msg">❌ Try again!</p>}

          <div className="score">Score: {score} / {wordList.length}</div>
        </div>
      ) : (
        <div className="result-section">
          {score === wordList.length && <Confetti width={width} height={height} />}
          <h2>❄️ You unfroze all the words!</h2>
          <p>Your final score: {score} / {wordList.length}</p>
          <button className="restart-btn" onClick={handleRestart}>🔁 Play Again</button>
          {currentLevel !== 'level2' && (
            <button className="restart-btn" onClick={handleNextLevel}>➡️ Next Level</button>
          )}
        </div>
      )}
    </div>
  );
}

export default WordFreezeActivity;
