// src/pages/PhonicsPopActivity.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';
import './PhonicsPopActivity.css';

// ses dosyaları (public/sounds klasöründe)
const correctAudio = new Audio('/sounds/correct.mp3');
const wrongAudio   = new Audio('/sounds/wrong.mp3');
const successAudio = new Audio('/sounds/success.mp3');

// Her harf için doğru kelimeler/emojiler
const wordMap = {
  A: [{ label: 'Ant', image: '🐜' }, { label: 'Apple', image: '🍎' }],
  B: [{ label: 'Ball', image: '⚽' }, { label: 'Banana', image: '🍌' }],
  C: [{ label: 'Cat', image: '🐱' }, { label: 'Car', image: '🚗' }],
  D: [{ label: 'Dog', image: '🐶' }, { label: 'Duck', image: '🦆' }],
  E: [{ label: 'Elephant', image: '🐘' }, { label: 'Egg', image: '🥚' }],
  F: [{ label: 'Fish', image: '🐟' }, { label: 'Frog', image: '🐸' }],
  G: [{ label: 'Goat', image: '🐐' }, { label: 'Grapes', image: '🍇' }],
  H: [{ label: 'Hat', image: '🎩' }, { label: 'Horse', image: '🐴' }],
  I: [{ label: 'Ice Cream', image: '🍨' }, { label: 'Igloo', image: '🏠' }],
  J: [{ label: 'Jar', image: '🫙' }, { label: 'Jacket', image: '🧥' }],
  K: [{ label: 'Kite', image: '🪁' }, { label: 'Kangaroo', image: '🦘' }],
  L: [{ label: 'Lion', image: '🦁' }, { label: 'Lemon', image: '🍋' }],
  M: [{ label: 'Monkey', image: '🐒' }, { label: 'Mango', image: '🥭' }],
  N: [{ label: 'Nest', image: '🪹' }, { label: 'Notebook', image: '📒' }],
  O: [{ label: 'Octopus', image: '🐙' }, { label: 'Orange', image: '🍊' }],
  P: [{ label: 'Pig', image: '🐷' }, { label: 'Pizza', image: '🍕' }],
  Q: [{ label: 'Queen', image: '👑' }, { label: 'Quilt', image: '🛏️' }],
  R: [{ label: 'Rabbit', image: '🐇' }, { label: 'Rainbow', image: '🌈' }],
  S: [{ label: 'Sun', image: '☀️' }, { label: 'Strawberry', image: '🍓' }],
  T: [{ label: 'Tiger', image: '🐯' }, { label: 'Tomato', image: '🍅' }],
  U: [{ label: 'Umbrella', image: '☂️' }, { label: 'Unicorn', image: '🦄' }],
  V: [{ label: 'Violin', image: '🎻' }, { label: 'Volcano', image: '🌋' }],
  W: [{ label: 'Whale', image: '🐳' }, { label: 'Watermelon', image: '🍉' }],
  X: [{ label: 'Xylophone', image: '🎼' }, { label: 'X-ray', image: '🩻' }],
  Y: [{ label: 'Yacht', image: '⛵' }, { label: 'Yo-yo', image: '🪀' }],
  Z: [{ label: 'Zebra', image: '🦓' }, { label: 'Zip', image: '🪢' }]
};

// Yanlış seçenek havuzu
function getWrongOptions(letter) {
  const pool = Object.entries(wordMap)
    .filter(([l]) => l !== letter)
    .flatMap(([, words]) => words.map(w => ({ ...w, correct: false })));
  return pool.sort(() => Math.random() - 0.5).slice(0, 2);
}

// Tüm harf bazlı veri seti
const baseData = Object.entries(wordMap).map(([letter, words]) => ({
  letter,
  options: [
    ...words.map(w => ({ ...w, correct: true })),
    ...getWrongOptions(letter)
  ]
}));

// Stage grupları
const stageGroups = [
  ['A','B','C','D','E','F'],
  ['G','H','I','J','K','L'],
  ['M','N','O','P','Q','R'],
  ['S','T','U','V','W','X','Y','Z']
];
const stageData = stageGroups.map(group =>
  group.map(letter => {
    const data = baseData.find(d => d.letter === letter);
    return {
      letter,
      options: data ? [...data.options].sort(() => Math.random() - 0.5) : []
    };
  })
);

export default function PhonicsPopActivity() {
  const INITIAL_TIME = 15;
  const navigate = useNavigate();

  // State’ler
  const [stageIndex, setStageIndex]     = useState(0);
  const [letterIndex, setLetterIndex]   = useState(0);
  const [score, setScore]               = useState(0);
  const [highScore, setHighScore]       = useState(
    () => parseInt(localStorage.getItem('phonicsHighScore') || '0', 10)
  );
  const [popped, setPopped]             = useState([]);
  const [combo, setCombo]               = useState(1);
  const [timer, setTimer]               = useState(INITIAL_TIME);
  const [finished, setFinished]         = useState(false);
  const [isIntermission, setIsIntermission] = useState(false);
  const [stageCorrect, setStageCorrect]     = useState(0);
  const [stageWrong, setStageWrong]         = useState(0);

  const stage   = stageData[stageIndex]     || [];
  const current = stage[letterIndex]       || { letter: '', options: [] };

  // Harfe geçildiğinde harf sesi
  useEffect(() => {
    if (finished || isIntermission) return;
    const audio = new Audio(`/sounds/letters/${current.letter}.ogg`);
    audio.play().catch(e => console.warn('Audio play failed:', e));
  }, [stageIndex, letterIndex, finished, isIntermission]);

  // Konfeti ve success sesi intermission’da
  useEffect(() => {
    if (!isIntermission) return;
    successAudio.currentTime = 0;
    successAudio.play().catch(() => {});
  }, [isIntermission]);

  // Konfeti ve success sesi finished’ta
  useEffect(() => {
    if (!finished) return;
    successAudio.currentTime = 0;
    successAudio.play().catch(() => {});
  }, [finished]);

  // Timer & timeout
  useEffect(() => {
    if (finished || isIntermission) return;
    setTimer(INITIAL_TIME);
    const iv = setInterval(() => setTimer(t => Math.max(t-1, 0)), 1000);
    const to = setTimeout(handleTimeout, INITIAL_TIME * 1000);
    return () => { clearInterval(iv); clearTimeout(to); };
  }, [stageIndex, letterIndex, finished, isIntermission]);

  // Tüm doğrular tamamlandığında otomatik next
  useEffect(() => {
    if (finished || isIntermission) return;
    const totalCorrect  = wordMap[current.letter]?.length || 0;
    const poppedCorrect = current.options.filter((o,i)=>o.correct && popped.includes(i)).length;
    if (poppedCorrect === totalCorrect) setTimeout(next, 500);
  }, [popped, finished, isIntermission]);

  function handlePop(idx) {
    if (popped.includes(idx) || finished || isIntermission) return;
    setPopped(p => [...p, idx]);

    if (current.options[idx].correct) {
      correctAudio.currentTime = 0;
      correctAudio.play().catch(() => {});
      setScore(s => s + combo);
      setCombo(c => c + 1);
      setStageCorrect(c => c + 1);
    } else {
      wrongAudio.currentTime = 0;
      wrongAudio.play().catch(() => {});
      setScore(s => s - 1);
      setCombo(1);
      setStageWrong(w => w + 1);
    }
  }

  function handleTimeout() {
    wrongAudio.currentTime = 0;
    wrongAudio.play().catch(() => {});
    setScore(s => s - 1);
    setStageWrong(w => w + 1);
    next();
  }

  function next() {
    setPopped([]); setCombo(1);
    if (letterIndex < stage.length - 1) {
      setLetterIndex(i => i + 1);
    } else if (stageIndex < stageData.length - 1) {
      setIsIntermission(true);
    } else {
      setFinished(true);
      if (score > highScore) {
        localStorage.setItem('phonicsHighScore', score);
        setHighScore(score);
      }
    }
  }

  function handleContinue() {
    setIsIntermission(false);
    setLetterIndex(0);
    setStageIndex(s => s + 1);
    setStageCorrect(0);
    setStageWrong(0);
  }

  function handleRestart() {
    setStageIndex(0); setLetterIndex(0);
    setScore(0); setPopped([]); setCombo(1);
    setFinished(false); setIsIntermission(false);
    setStageCorrect(0); setStageWrong(0);
  }

  // — Intermission Modal —
  if (isIntermission) {
    return (
      <>
        {/* Full-screen konfeti */}
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          numberOfPieces={150}
          recycle={false}
          gravity={0.3}
          style={{ position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 1000 }}
        />
        <div className="phonics-pop-intermission">
          <h2>Stage {stageIndex+1} Complete!</h2>
          <p>You got {stageCorrect} correct and {stageWrong} wrong this round.</p>
          <button className="phonics-pop-btn" onClick={handleContinue}>
            Continue
          </button>
        </div>
      </>
    );
  }

  // — Finished Ekranı —
  if (finished) {
    return (
      <>
        {/* Full-screen konfeti */}
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          numberOfPieces={200}
          recycle={false}
          gravity={0.3}
          style={{ position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 1000 }}
        />
        <div className="phonics-pop-container">
          <h2 className="phonics-pop-congrats">Congratulations!</h2>
          <p>You completed all stages!</p>
          <div className="phonics-pop-score-summary">
            <p>Your Score: {score}</p>
            <p>High Score: {highScore}</p>
          </div>
          <div className="phonics-pop-end-buttons">
            <button className="phonics-pop-btn" onClick={handleRestart}>
              Play Again
            </button>
            <button className="phonics-pop-btn" onClick={() => navigate('/module/english/activities')}>
              Go to Activities
            </button>
          </div>
        </div>
      </>
    );
  }

  // — Ana Oyun Ekranı —
  return (
    <div className="phonics-pop-container">
      <div className="phonics-pop-header">
        <div className="phonics-pop-score-box">Score: {score}</div>
        <div className="phonics-pop-highscore-box">High Score: {highScore}</div>
      </div>
      <div className="phonics-pop-subheader">
        <div className="phonics-pop-timer">Time: {timer}s</div>
        <div className="phonics-pop-combo">Combo x{combo}</div>
      </div>
      <h2 className="phonics-pop-title">Stage {stageIndex+1} – Letter {current.letter}</h2>
      <div key={`${stageIndex}-${letterIndex}`} className="phonics-pop-balloon-area">
        {current.options.map((item, idx) => (
          <div
            key={idx}
            className={`phonics-pop-balloon ${popped.includes(idx) ? 'phonics-pop-popped' : ''}`}
            onClick={() => handlePop(idx)}
            style={{ animationDelay: `${idx*0.5}s`, left: `${20+idx*20}%` }}
          >
            <span className="phonics-pop-emoji">{item.image}</span>
            <span className="phonics-pop-label">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
