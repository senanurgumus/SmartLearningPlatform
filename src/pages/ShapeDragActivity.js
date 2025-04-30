import React, { useState, useEffect, useRef } from 'react';
import { updateHighScore, fetchHighScore } from "../utils/highScore.js";
import Confetti from 'react-confetti';
import { useWindowSize } from '@react-hook/window-size';
import './ShapeDragActivity.css';

const levelShapes = {
  easy: ['square', 'circle', 'triangle'],
  medium: ['square', 'circle', 'triangle', 'rectangle', 'star'],
  hard: ['square', 'circle', 'triangle', 'rectangle', 'star', 'pentagon', 'hexagon'],
  expert: ['square', 'circle', 'triangle', 'rectangle', 'star', 'pentagon', 'hexagon', 'heart'],
  master: ['square', 'circle', 'triangle', 'rectangle', 'star', 'pentagon', 'hexagon', 'heart', 'cross'],
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
  const nextLevels = ['easy', 'medium', 'hard', 'expert', 'master'];
  const [highScore, setHighScore] = useState(0);

  const handleNextLevel = () => {
    const currentIndex = nextLevels.indexOf(level);
    if (currentIndex < nextLevels.length - 1) {
      setLevel(nextLevels[currentIndex + 1]);
    }
  };

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
    setScore(0);

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

  useEffect(() => {
    fetchHighScore("shapeDrag").then(setHighScore);
  }, []);

  useEffect(() => {
    if (gameCompleted) {
      handleGameEnd(); // 🎯 Oyun bitince yüksek skoru kaydet
    }
  }, [gameCompleted]);

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
      setCompletedShapes((prev) => {
        if (!prev.includes(targetShape)) {
          setScore((prevScore) => prevScore + 10);
          return [...prev, targetShape];
        }
        return prev;
      });
    } else {
      setScore((prev) => Math.max(0, prev - 5));
    }

    setTimeout(() => {
      setDropFeedback((prev) => ({
        ...prev,
        [targetShape]: '',
      }));
    }, 400);

    setDraggedShape(null);
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleRestart = () => {
    startLevel();
  };

  const handleGameEnd = () => {
    updateHighScore("shapeDrag", score);
    if (score > highScore) {
      setHighScore(score);
    }
  };

  return (
    <div className="shape-drag-container">
      <h2>🎯 Drag the Shape (Level: {level})</h2>
      <p>Match the shape to the correct target!</p>

      <div className="dropdown">
        <label>Level: </label>
        <select value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="easy">🟢 Easy</option>
          <option value="medium">🟠 Medium</option>
          <option value="hard">🔴 Hard</option>
          <option value="expert">⚫ Expert</option>
          <option value="master">👑 Master</option>
        </select>
      </div>

      <div className="score-time-container">
        <span>🧠 Score: {score}</span>
        <span>⏱️ Time: {time} s</span>
        <span>🏆 High Score: {highScore}</span>
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
            key={`${targetShape}-${index}-${level}`}
            className={`drop-zone ${
              dropFeedback[targetShape] === 'incorrect' ? 'incorrect' :
              dropFeedback[targetShape] === 'correct' ? 'correct' : ''
            }`}
            onDrop={() => handleDrop(targetShape)}
            onDragOver={handleDragOver}
          >
            <strong>{targetShape.toUpperCase()}</strong>
          </div>
        ))}
      </div>

      {gameCompleted && (
        <div className="message-button-wrapper">
          {isTimeUp ? (
            <div className="time-up-message">⏳ Time's Up!</div>
          ) : (
            <>
              <div className="congrats-message">🎉 Congratulations! All matches are correct!</div>
              <Confetti
                width={width}
                height={height}
                numberOfPieces={200}
                recycle={false}
                initialVelocityY={10}
                style={{ position: 'fixed', zIndex: 999, pointerEvents: 'none' }}
              />
              {level !== 'master' && (
                <button className="next-button" onClick={handleNextLevel}>➡️ Next Level</button>
              )}
            </>
          )}
          <button className="restart-button" onClick={handleRestart}>🔁 Play Again</button>
        </div>
      )}
    </div>
  );
}

export default ShapeDragActivity;
