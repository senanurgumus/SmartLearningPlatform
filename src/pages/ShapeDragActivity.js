// ShapeDragActivity.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from '@react-hook/window-size';
import { fetchHighScore, updateHighScore } from '../utils/highScore.js';
import './ShapeDragActivity.css';

const levelShapes = {
  easy:    ['square','circle','triangle'],
  medium:  ['square','circle','triangle','rectangle','star'],
  hard:    ['square','circle','triangle','rectangle','star','pentagon','hexagon'],
  expert:  ['square','circle','triangle','rectangle','star','pentagon','hexagon','heart'],
  master:  ['square','circle','triangle','rectangle','star','pentagon','hexagon','heart','cross'],
};

export default function ShapeDragActivity() {
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

  useEffect(() => {
    fetchHighScore('shapeDrag').then(setHighScore);
  }, []);

  useEffect(() => {
    startLevel();
    return () => clearInterval(intervalRef.current);
  }, [level, startLevel]);

  const handleGameEnd = useCallback(() => {
    updateHighScore('shapeDrag', score).then(setHighScore);
  }, [score]);

  useEffect(() => {
    if (targets.length && completedShapes.length === targets.length) {
      clearInterval(intervalRef.current);
      setGameCompleted(true);
      handleGameEnd();
    }
  }, [completedShapes, targets, handleGameEnd]);

  useEffect(() => {
    if (time >= 60 && !gameCompleted) {
      clearInterval(intervalRef.current);
      setIsTimeUp(true);
      setGameCompleted(true);
      handleGameEnd();
    }
  }, [time, gameCompleted, handleGameEnd]);

  const [dragged, setDragged] = useState(null);
  const handleDragStart = shape => setDragged(shape);
  const handleDragOver  = e => e.preventDefault();

  const handleDrop = target => {
    if (gameCompleted) return;
    const correct = dragged === target;
    setDropFeedback(fb => ({ ...fb, [target]: correct ? 'correct' : 'incorrect' }));

    if (correct) {
      setCompleted(prev => {
        if (!prev.includes(target)) {
          setScore(s => s + 10);
          return [...prev, target];
        }
        return prev;
      });
    } else {
      setScore(s => Math.max(0, s - 5));
    }

    setTimeout(() => setDropFeedback(fb => ({ ...fb, [target]: '' })), 400);
    setDragged(null);
  };

  const nextLevel = () => {
    const idx = levelsOrder.indexOf(level);
    if (idx < levelsOrder.length - 1) setLevel(levelsOrder[idx + 1]);
  };
  const restart = () => startLevel();

  return (
    <div className="sda-container">
      <div className="sda-card">
        <h2 className="sda-title">🎯 Drag the Shape (Level: {level})</h2>
        <p className="sda-instructions">Match the shape to the correct target!</p>

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
                <div className="sda-congrats-message">🎉 Congrats! All matched!</div>
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
                {level !== 'master' && (
                  <button className="sda-next-button" onClick={nextLevel}>Next Level ➡️</button>
                )}
              </>
            )}
            <button className="sda-restart-button" onClick={restart}>🔁 Play Again</button>
          </div>
        )}
      </div>
    </div>
  );
}