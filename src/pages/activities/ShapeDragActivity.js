import React, { useState, useEffect, useRef } from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from '@react-hook/window-size';
import './ShapeDragActivity.css';

const levelShapes = {
  easy: ['square', 'circle', 'triangle'],
  medium: ['square', 'circle', 'triangle', 'rectangle', 'star'],
  hard: ['square', 'circle', 'triangle', 'rectangle', 'star', 'pentagon', 'hexagon'],
};

function ShapeDragActivity() {
  const [draggedShape, setDraggedShape] = useState(null);
  const [draggables, setDraggables] = useState([]);
  const [targets, setTargets] = useState([]);
  const [dropFeedback, setDropFeedback] = useState({});
  const [completedShapes, setCompletedShapes] = useState([]);
  const [level, setLevel] = useState('easy');
  const [gameCompleted, setGameCompleted] = useState(false);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(0);
  const intervalRef = useRef(null);
  const [width, height] = useWindowSize();

  const shuffle = (array) => [...array].sort(() => Math.random() - 0.5);

  const startLevel = () => {
    const selected = levelShapes[level];
    setDraggables(shuffle(selected));
    setTargets(shuffle(selected));
    setDropFeedback({});
    setCompletedShapes([]);
    setGameCompleted(false);
    setIsTimeUp(false);
    setTime(0);

    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setTime((prev) => prev + 1);
    }, 1000);
  };

  useEffect(() => {
    startLevel();
    return () => clearInterval(intervalRef.current);
  }, [level]);

  useEffect(() => {
    if (time >= 60 && !gameCompleted) {
      setGameCompleted(true);
      setIsTimeUp(true);
      clearInterval(intervalRef.current);
    }
  }, [time, gameCompleted]);

  useEffect(() => {
    if (targets.length > 0 && completedShapes.length === targets.length) {
      setGameCompleted(true);
      setIsTimeUp(false);
      clearInterval(intervalRef.current);
    }
  }, [completedShapes, targets]);

  const handleDragStart = (shape) => {
    setDraggedShape(shape);
  };

  const handleDrop = (targetShape) => {
    if (gameCompleted || isTimeUp) return;

    const isCorrect = draggedShape === targetShape;

    setDropFeedback((prev) => ({
      ...prev,
      [targetShape]: isCorrect ? 'correct' : 'incorrect',
    }));

    if (isCorrect) {
      setScore((prev) => prev + 10);
      setCompletedShapes((prev) => [...prev, targetShape]);
    } else {
      setScore((prev) => Math.max(0, prev - 5));
    }

    setTimeout(() => {
      setDropFeedback((prev) => ({
        ...prev,
        [targetShape]: '',
      }));
    }, 300);

    setDraggedShape(null);
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleRestart = () => {
    startLevel();
  };

  return (
    <div className="shape-drag-container">
      <h2>🎯 Şekil Sürükle (Seviye: {level})</h2>
      <p>Doğru şekli doğru kutuya sürükle!</p>

      <div className="dropdown">
        <label>Seviye: </label>
        <select value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="easy">🟢 Kolay</option>
          <option value="medium">🟠 Orta</option>
          <option value="hard">🔴 Zor</option>
        </select>
      </div>

      <div className="score-time-container">
        <span>🧠 Skor: {score}</span>
        <span>⏱️ Süre: {time} saniye</span>
      </div>

      <div className="shapes">
        {draggables.map((shape, index) => (
          <div
            key={`${shape}-${index}-${level}`}
            className={`shape ${shape}`}
            draggable={!gameCompleted}
            onDragStart={() => handleDragStart(shape)}
          />
        ))}
      </div>

      <div className="targets">
        {targets.map((targetShape, index) => (
          <div
            key={`${targetShape}-${index}-${level}-${dropFeedback[targetShape] || 'none'}`}
            className={`drop-zone ${
              dropFeedback[targetShape] === 'incorrect' ? 'shake incorrect' :
              dropFeedback[targetShape] === 'correct' ? 'correct' : ''
            }`}
            onDrop={() => handleDrop(targetShape)}
            onDragOver={handleDragOver}
          >
            <strong>{targetShape.toUpperCase()}</strong>
          </div>
        ))}
      </div>

      {gameCompleted && !isTimeUp && (
        <>
          <div className="congrats-message">🎉 Tebrikler! Tüm eşleşmeler doğru!</div>
          <Confetti
            width={width}
            height={height}
            numberOfPieces={200}
            recycle={false}
            initialVelocityY={10}
            style={{ position: 'fixed', zIndex: 999, pointerEvents: 'none' }}
          />
          <button className="restart-button" onClick={handleRestart}>🔄 Tekrar Oyna</button>
        </>
      )}

      {gameCompleted && isTimeUp && (
        <>
          <div className="time-up-message">⏳ Süre Doldu!</div>
          <button className="restart-button" onClick={handleRestart}>🔄 Tekrar Oyna</button>
        </>
      )}
    </div>
  );
}

export default ShapeDragActivity;
