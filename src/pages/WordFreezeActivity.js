// src/components/WordFreezeActivity.js
import React, { useState } from 'react';
import './WordFreezeActivity.css';
import Confetti from 'react-confetti';
import { useWindowSize } from '@react-hook/window-size';

// Shuffle helper
const shuffleArray = arr => [...arr].sort(() => Math.random() - 0.5);

// Define word lists for each mode (30 items each, age-8 appropriate)
const wordLevels = {
  level1: [
    { target: 'Big', options: ['Huge', 'Tiny', 'Fast'], correct: 'Huge' },
    { target: 'Happy', options: ['Joyful', 'Sad', 'Loud'], correct: 'Joyful' },
    { target: 'Cold', options: ['Hot', 'Freezing', 'Warm'], correct: 'Freezing' },
    { target: 'Quick', options: ['Slow', 'Fast', 'Short'], correct: 'Fast' },
    { target: 'Angry', options: ['Mad', 'Glad', 'Bright'], correct: 'Mad' },
    { target: 'Fast', options: ['Quick', 'Slow', 'Short'], correct: 'Quick' },
    { target: 'Strong', options: ['Weak', 'Powerful', 'Tough'], correct: 'Powerful' },
    { target: 'Beautiful', options: ['Ugly', 'Pretty', 'Mean'], correct: 'Pretty' },
    { target: 'Smart', options: ['Intelligent', 'Slow', 'Fast'], correct: 'Intelligent' },
    { target: 'Funny', options: ['Humorous', 'Boring', 'Serious'], correct: 'Humorous' },
    { target: 'Small', options: ['Tiny', 'Little', 'Short'], correct: 'Tiny' },
    { target: 'Near', options: ['Close', 'Far', 'High'], correct: 'Close' },
    { target: 'Jump', options: ['Hop', 'Leap', 'Run'], correct: 'Hop' },
    { target: 'Laugh', options: ['Giggle', 'Cry', 'Smile'], correct: 'Giggle' },
    { target: 'Smile', options: ['Grin', 'Smile', 'Frown'], correct: 'Grin' },
    { target: 'Brave', options: ['Courageous', 'Scared', 'Shy'], correct: 'Courageous' },
    { target: 'Quiet', options: ['Silent', 'Loud', 'Noisy'], correct: 'Silent' },
    { target: 'Clean', options: ['Pure', 'Dirty', 'Messy'], correct: 'Pure' },
    { target: 'Good', options: ['Great', 'Bad', 'Okay'], correct: 'Great' },
    { target: 'Scared', options: ['Afraid', 'Brave', 'Happy'], correct: 'Afraid' },
    { target: 'Noisy', options: ['Quiet', 'Loud', 'Calm'], correct: 'Loud' },
    { target: 'Begin', options: ['Start', 'End', 'Stop'], correct: 'Start' },
    { target: 'Finish', options: ['Complete', 'Start', 'End'], correct: 'Complete' },
    { target: 'Look', options: ['See', 'Watch', 'Hide'], correct: 'See' },
    { target: 'Sleep', options: ['Nap', 'Eat', 'Rest'], correct: 'Nap' },
    { target: 'Kind', options: ['Nice', 'Mean', 'Rude'], correct: 'Nice' },
    { target: 'Bright', options: ['Shiny', 'Dim', 'Dark'], correct: 'Shiny' },
    { target: 'Soft', options: ['Hard', 'Fluffy', 'Firm'], correct: 'Fluffy' },
    { target: 'Clean', options: ['Dirty', 'Tidy', 'Messy'], correct: 'Tidy' },
    { target: 'High', options: ['Low', 'Tall', 'Deep'], correct: 'Tall' }
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
    { target: 'Clean', options: ['Dirty', 'Neat', 'Clear'], correct: 'Dirty' },
    { target: 'Small', options: ['Big', 'Tiny', 'Little'], correct: 'Big' },
    { target: 'Weak', options: ['Strong', 'Fragile', 'Soft'], correct: 'Strong' },
    { target: 'Light', options: ['Dark', 'Heavy', 'Soft'], correct: 'Dark' },
    { target: 'Always', options: ['Never', 'Sometimes', 'Often'], correct: 'Never' },
    { target: 'True', options: ['False', 'Real', 'Fact'], correct: 'False' },
    { target: 'Hard', options: ['Soft', 'Easy', 'Light'], correct: 'Soft' },
    { target: 'Quiet', options: ['Loud', 'Silent', 'Calm'], correct: 'Loud' },
    { target: 'Begin', options: ['Stop', 'Start', 'Pause'], correct: 'Stop' },
    { target: 'Sleep', options: ['Awake', 'Nap', 'Dream'], correct: 'Awake' },
    { target: 'Love', options: ['Hate', 'Like', 'Enjoy'], correct: 'Hate' },
    { target: 'Wet', options: ['Dry', 'Damp', 'Moist'], correct: 'Dry' },
    { target: 'Win', options: ['Lose', 'Tie', 'Play'], correct: 'Lose' },
    { target: 'Inside', options: ['Outside', 'Inside', 'Center'], correct: 'Outside' },
    { target: 'Above', options: ['Below', 'Over', 'Under'], correct: 'Below' },
    { target: 'Bright', options: ['Dim', 'Dark', 'Glow'], correct: 'Dim' },
    { target: 'Smooth', options: ['Rough', 'Soft', 'Hard'], correct: 'Rough' },
    { target: 'Accept', options: ['Decline', 'Take', 'Give'], correct: 'Decline' },
    { target: 'Include', options: ['Exclude', 'Add', 'Remove'], correct: 'Exclude' }
  ]
};

// Map mode keys to labels
const levelLabels = { level1: 'Same', level2: 'Opposite' };

export default function WordFreezeActivity() {
  const [currentLevel, setCurrentLevel] = useState('level1');
  // generate random 10-question session
  const [questions, setQuestions] = useState(
    () => shuffleArray(wordLevels[currentLevel]).slice(0, 10)
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [unfrozen, setUnfrozen] = useState(false);
  const [firstTry, setFirstTry] = useState(true);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [showWrong, setShowWrong] = useState(false);
  const [width, height] = useWindowSize();

  const current = questions[currentIndex];
  const total = questions.length;

  const playSound = src => new Audio(src).play();

  const handleChoice = choice => {
    if (unfrozen) return;
    if (choice === current.correct) {
      playSound('/sounds/ice-break.mp3');
      setUnfrozen(true);
      if (firstTry) setScore(prev => prev + 1);
      setShowWrong(false);
      setTimeout(() => {
        if (currentIndex + 1 < total) {
          setCurrentIndex(prev => prev + 1);
          setUnfrozen(false);
          setFirstTry(true);
        } else {
          setShowResult(true);
        }
      }, 1000);
    } else {
      playSound('/sounds/wrong.mp3');
      setShowWrong(true);
      setFirstTry(false);
    }
  };

  const resetSession = level => {
    setQuestions(shuffleArray(wordLevels[level]).slice(0, 10));
    setCurrentIndex(0);
    setScore(0);
    setUnfrozen(false);
    setShowWrong(false);
    setShowResult(false);
    setFirstTry(true);
  };

  const handleRestart = () => resetSession(currentLevel);
  const handleLevelChange = e => {
    const lvl = e.target.value;
    setCurrentLevel(lvl);
    resetSession(lvl);
  };
  const handleNextLevel = () => {
    const keys = Object.keys(wordLevels);
    const idx = keys.indexOf(currentLevel);
    if (idx < keys.length - 1) {
      const next = keys[idx + 1];
      setCurrentLevel(next);
      resetSession(next);
    }
  };

  return (
    <div className="wf-freeze-container" style={{ position: 'relative', backgroundImage: 'url("/images/bg-ice-page.png")', backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundAttachment: 'fixed', backgroundPosition: 'center', minHeight: '100vh' }}>
      {showResult && score === total && <Confetti width={width} height={height} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none', backgroundColor: 'transparent' }} />}

      <div className="wf-level-select">
        <label>Choose Category: </label>
        <select value={currentLevel} onChange={handleLevelChange}>
          {Object.keys(wordLevels).map(lvl => <option key={lvl} value={lvl}>{levelLabels[lvl]}</option>)}
        </select>
      </div>

      <h3 className="wf-mode-info">{currentLevel === 'level1' ? 'Which word means the same?' : 'Which word means the opposite?'}</h3>

      {!showResult ? (
        <div className="wf-freeze-card">
          <div className={`wf-ice-word ${unfrozen ? 'wf-unfrozen' : ''}`} style={!unfrozen ? { backgroundImage: 'url("/images/ice-bg.png")' } : {}}>{current.target}</div>
          <div className="wf-choices">{current.options.map((opt, i) => <button key={i} className="wf-choice-btn" onClick={() => handleChoice(opt)}>{opt}</button>)}</div>
          {showWrong && <p className="wf-wrong-msg">❌ Try again!</p>}
          <div className="wf-score">Score: {score} / {total}</div>
        </div>
      ) : (
        <div className="wf-result-section">
          <h2>❄️ You unfroze all the words!</h2>
          <p>Your final score: {score} / {total}</p>
          <div className="wf-button-group">
            <button className="wf-restart-btn" onClick={handleRestart}>🔁 Play Again</button>
            {currentLevel !== 'level2' && <button className="wf-restart-btn" onClick={handleNextLevel}>➡️ Next Level</button>}
          </div>
        </div>
      )}
    </div>
  );
}