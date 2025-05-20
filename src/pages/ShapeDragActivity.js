// src/pages/ShapeDragActivity.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from '@react-hook/window-size';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { fetchHighScore, updateHighScore } from '../utils/highScore.js';
import './ShapeDragActivity.css';

/* ───────────── SES KANCASI ───────────── */
const useSound = path => useRef(new Audio(path));

const levelShapes = {
  easy:    ['square','circle','triangle'],
  medium:  ['square','circle','triangle','rectangle','star'],
  hard:    ['square','circle','triangle','rectangle','star','pentagon','hexagon'],
  expert:  ['square','circle','triangle','rectangle','star','pentagon','hexagon','heart'],
  master:  ['square','circle','triangle','rectangle','star','pentagon','hexagon','heart','cross'],
};

export default function ShapeDragActivity() {
  /* ───────────── SES REFERANSLARI ───────────── */
  const correctSfx = useSound('/sounds/correct.mp3');
  const wrongSfx   = useSound('/sounds/wrong.mp3');
  const successSfx = useSound('/sounds/success.mp3');

  /* ───────────── STATE ───────────── */
  const [level, setLevel]               = useState('easy');
  const [draggables, setDraggables]     = useState([]);
  const [targets, setTargets]           = useState([]);
  const [dropFeedback, setDropFeedback] = useState({});
  const [completedShapes, setCompleted] = useState([]);
  const [score, setScore]               = useState(0);
  const [highScore, setHighScore]       = useState(0);
  const [time, setTime]                 = useState(0);
  const [isTimeUp, setIsTimeUp]         = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);

  const intervalRef = useRef(null);
  const [width, height] = useWindowSize();
  const levelsOrder = ['easy','medium','hard','expert','master'];
  const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);

  const auth = getAuth();

  /* ───────────── OYUNU BAŞLAT ───────────── */
  const startLevel = useCallback(() => {
    const shapes = levelShapes[level];
    setDraggables(shuffle(shapes));
    setTargets(shuffle(shapes));
    setDropFeedback({});
    setCompleted([]);
    setScore(0);
    setTime(0);
    setIsTimeUp(false);
    setGameCompleted(false);

    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => setTime(t => t + 1), 1000);
  }, [level]);

  /* ───────────── HIGH SCORE ÇEKME ───────────── */
  useEffect(() => {
    // Auth durumunu dinle, user hazır olunca skor çek
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        fetchHighScore('shapeDrag')
          .then(setHighScore)
          .catch(console.error);
      }
    });
    return unsubscribe;
  }, [auth]);

  /* ───────────── LEVEL / ZAMAN AYARI ───────────── */
  useEffect(() => {
    startLevel();
    return () => clearInterval(intervalRef.current);
  }, [level, startLevel]);

  const handleGameEnd = useCallback(() => {
    updateHighScore('shapeDrag', score)
      .then(setHighScore)
      .catch(console.error);
  }, [score]);

  /* ───────────── BAŞARIYI TESPİT ───────────── */
  useEffect(() => {
    if (targets.length && completedShapes.length === targets.length) {
      clearInterval(intervalRef.current);
      setGameCompleted(true);
      handleGameEnd();
      successSfx.current.currentTime = 0;
      successSfx.current.play();
    }
  }, [completedShapes, targets, handleGameEnd]);

  /* ───────────── SÜRE DOLDU MU? ───────────── */
  useEffect(() => {
    if (time >= 60 && !gameCompleted) {
      clearInterval(intervalRef.current);
      setIsTimeUp(true);
      setGameCompleted(true);
      handleGameEnd();
    }
  }, [time, gameCompleted, handleGameEnd]);

  /* ───────────── DRAG & DROP ───────────── */
  const [dragged, setDragged] = useState(null);
  const handleDragStart = shape => setDragged(shape);
  const handleDragOver  = e => e.preventDefault();

  const handleDrop = target => {
    if (gameCompleted) return;

    const correct = dragged === target;
    setDropFeedback(fb => ({ ...fb, [target]: correct ? 'correct' : 'incorrect' }));

    if (correct) {
      correctSfx.current.currentTime = 0;
      correctSfx.current.play();

      setCompleted(prev => {
        if (!prev.includes(target)) {
          setScore(s => s + 10);
          return [...prev, target];
        }
        return prev;
      });
    } else {
      wrongSfx.current.currentTime = 0;
      wrongSfx.current.play();
      setScore(s => Math.max(0, s - 5));
    }

    setTimeout(() => setDropFeedback(fb => ({ ...fb, [target]: '' })), 400);
    setDragged(null);
  };

  /* ───────────── BUTON YARDIMCILAR ───────────── */
  const nextLevel = () => {
    const idx = levelsOrder.indexOf(level);
    if (idx < levelsOrder.length - 1) setLevel(levelsOrder[idx + 1]);
  };
  const restart = () => startLevel();

  /* ───────────── RENDER ───────────── */
  return (
    <div className="sda-container">
      <h1 className="sda-page-header">🎯 Drag the Shape</h1>

      <div className="sda-card">
        <p className="sda-instructions">
          Match the shape to the correct target!
        </p>

        <div className="sda-dropdown">
          <label>Level:</label>
          <select value={level} onChange={e => setLevel(e.target.value)}>
            {levelsOrder.map(lv => (
              <option key={lv} value={lv}>
                {lv.charAt(0).toUpperCase() + lv.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="sda-score-time-container">
          <span>🧠 Score: {score}</span>
          <span>⏱️ Time: {time}s</span>
          <span>🏆 High Score: {highScore}</span>
        </div>

        <div className="sda-shapes">
          {draggables.map(shape => (
            <div
              key={shape}
              className={`sda-shape sda-${shape}`}
              draggable={!gameCompleted}
              onDragStart={() => handleDragStart(shape)}
            />
          ))}
        </div>

        <div className="sda-targets">
          {targets.map(shape => (
            <div
              key={shape}
              className={`sda-drop-zone ${dropFeedback[shape]}`}
              onDrop={() => handleDrop(shape)}
              onDragOver={handleDragOver}
            >
              <strong>{shape.toUpperCase()}</strong>
            </div>
          ))}
        </div>

        {gameCompleted && (
          <div className="sda-message-button-wrapper">
            {isTimeUp ? (
              <div className="sda-time-up-message">⏳ Time's Up!</div>
            ) : (
              <>
                <div className="sda-congrats-message">
                  🎉 Congrats! All matched!
                </div>
                <Confetti
                  width={width}
                  height={height}
                  recycle={false}
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    pointerEvents: 'none',
                    backgroundColor: 'transparent',
                    zIndex: 0
                  }}
                />
              </>
            )}

            <div className="sda-buttons">
              {!isTimeUp && level !== 'master' && (
                <button className="sda-next-button" onClick={nextLevel}>
                  Next Level ➡️
                </button>
              )}
              <button className="sda-restart-button" onClick={restart}>
                🔁 Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
