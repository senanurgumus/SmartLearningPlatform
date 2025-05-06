// src/pages/Puzzle.js
import React, { useState, useEffect, useRef } from 'react';
import { useParams }            from 'react-router-dom';
import puzzles                  from '../data/puzzles.json';
import './Puzzle.css';

export default function Puzzle() {
  const { type } = useParams();               
  const { pieces } = puzzles[type] || { pieces: [] };

  // Build a title like "Butterfly Puzzle"
  const title = type
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const [grid, setGrid]           = useState([]);
  const [completed, setCompleted] = useState(false);
  const correctOrder              = useRef([]);
  const dragItem                  = useRef();
  const dragOverItem              = useRef();
  const hideTimeout               = useRef();

  // Helper to shuffle an array
  const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);

  // Initialize or reset puzzle
  const init = () => {
    correctOrder.current = [...pieces];
    setGrid(shuffle(pieces));
    setCompleted(false);
    clearTimeout(hideTimeout.current);
  };

  // On mount or when puzzle type changes
  useEffect(() => {
    if (pieces.length) init();
    return () => clearTimeout(hideTimeout.current);
  }, [pieces]);

  // Drag & drop handlers
  const handleDragStart = (_, idx) => { dragItem.current = idx; };
  const handleDragEnter = (_, idx) => { dragOverItem.current = idx; };
  const handleDragOver  = e => e.preventDefault();

  const handleDragEnd = () => {
    const newGrid = [...grid];
    const from    = dragItem.current;
    const to      = dragOverItem.current;

    // Swap the two pieces
    [newGrid[from], newGrid[to]] = [newGrid[to], newGrid[from]];
    setGrid(newGrid);

    // If solved, show congrats overlay, then hide after 3s
    if (JSON.stringify(newGrid) === JSON.stringify(correctOrder.current)) {
      setCompleted(true);
      clearTimeout(hideTimeout.current);
      hideTimeout.current = setTimeout(() => {
        setCompleted(false);
      }, 3000);
    }

    dragItem.current     = null;
    dragOverItem.current = null;
  };

  // If the puzzle type is invalid
  if (!pieces.length) {
    return <p className="puzzle-error">“{title}” puzzle not found.</p>;
  }

  return (
    <div className="puzzle-page">
      <h1>{title}</h1>

      {/* Congratulations overlay */}
      {completed && (
        <div className="congrats-overlay">Congratulations! 🎉</div>
      )}

      {/* Puzzle grid */}
      <div className="puzzle-grid">
        {grid.map((img, idx) => (
          <div
            key={idx}
            className="puzzle-cell"
            draggable
            onDragStart={e => handleDragStart(e, idx)}
            onDragEnter={e => handleDragEnter(e, idx)}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <img
              src={`/puzzles/${type}/${img}`}
              alt={`piece ${idx + 1}`}
            />
          </div>
        ))}
      </div>

      <button className="puzzle-button" onClick={init}>
        Shuffle
      </button>
    </div>
  );
}


