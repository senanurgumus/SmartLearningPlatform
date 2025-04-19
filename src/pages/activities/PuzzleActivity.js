
import React, { useState } from 'react';
import './PuzzleActivity.css';

function PuzzleActivity() {
  const puzzleOptions = {
    pets: ['piece1', 'piece2', 'piece3'],
    peacock: ['piece1', 'piece2', 'piece3'],
    squirrel: ['piece1', 'piece2', 'piece3']
  };

  const [selectedPuzzle, setSelectedPuzzle] = useState('pets');
  const [pieces, setPieces] = useState(() =>
    getShuffled(puzzleOptions['pets'])
  );
  const [draggedIndex, setDraggedIndex] = useState(null);

  // Gerçekten farklı bir dizilim üret
  function getShuffled(array) {
    let shuffled = [...array];
    do {
      shuffled = [...array].sort(() => Math.random() - 0.5);
    } while (JSON.stringify(shuffled) === JSON.stringify(array));
    return shuffled;
  }

  const handlePuzzleChange = (e) => {
    const newPuzzle = e.target.value;
    setSelectedPuzzle(newPuzzle);
    setPieces(getShuffled(puzzleOptions[newPuzzle]));
  };

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDrop = (index) => {
    const newPieces = [...pieces];
    const temp = newPieces[index];
    newPieces[index] = newPieces[draggedIndex];
    newPieces[draggedIndex] = temp;
    setPieces(newPieces);
  };

  const isCorrect =
    JSON.stringify(pieces) === JSON.stringify(puzzleOptions[selectedPuzzle]);

  return (
    <div className="puzzle-container">
      <h2>🧩 Puzzle</h2>
      <p>Parçaları doğru sıraya yerleştir!</p>

      <select value={selectedPuzzle} onChange={handlePuzzleChange}>
        <option value="pets">🐶 Evcil Hayvanlar</option>
        <option value="peacock">🦚 Tavus Kuşu</option>
        <option value="squirrel">🐿️ Sincap</option>
      </select>

      <div className="puzzle-row">
        {pieces.map((piece, index) => (
          <img
            key={index}
            src={`/puzzle/${selectedPuzzle}/${piece}.png`}
            alt={piece}
            className="puzzle-piece"
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(index)}
          />
        ))}
      </div>

      {isCorrect && (
        <div className="success-message">
          🎉 Tebrikler! Puzzle'ı doğru tamamladın!
        </div>
      )}
      
    </div>
  );
}

export default PuzzleActivity;
