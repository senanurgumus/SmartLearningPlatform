import React, { useState, useEffect } from 'react';
import './PuzzleActivity.css';
import Confetti from 'react-confetti';
import { useWindowSize } from '@react-hook/window-size';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

function PuzzleActivity() {
  const [selectedDifficulty, setSelectedDifficulty] = useState('easy');
  const [pieces, setPieces] = useState([]);
  const [correctOrder, setCorrectOrder] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [width, height] = useWindowSize();
  const [shake, setShake] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false); 
  const [soundPlayed, setSoundPlayed] = useState(false); 
  const [loading, setLoading] = useState(true); // Added loading state

  const db = getFirestore();
  const storage = getStorage();

  // Fetch puzzle data based on selected difficulty
  useEffect(() => {
    async function fetchPuzzleData() {
      console.log('Fetching puzzle data...');
      const q = query(collection(db, 'puzzles'), where('difficulty', '==', selectedDifficulty));
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('Fetched puzzle data:', data);
        fetchPuzzlePieces(data.pieces);
        setCorrectOrder(data.pieces); 
      });
    }

    fetchPuzzleData();
  }, [selectedDifficulty]);

  const fetchPuzzlePieces = async (piecesArray) => {
    console.log('Loading pieces...');
    const pieceUrls = [];
    for (let i = 0; i < piecesArray.length; i++) {
      const pieceRef = ref(storage, piecesArray[i]);
      try {
        const url = await getDownloadURL(pieceRef);
        pieceUrls.push(url);
        console.log(`Piece ${i} URL:`, url);
      } catch (error) {
        console.error('Error fetching piece:', error);
        alert('An error occurred while fetching pieces!');
      }
    }
    setPieces(getShuffled(pieceUrls)); 
    setLoading(false); // Set loading to false once pieces are fetched
  };

  const getShuffled = (array) => {
    let shuffled = [...array];
    do {
      shuffled = [...array].sort(() => Math.random() - 0.5);
    } while (JSON.stringify(shuffled) === JSON.stringify(array));
    return shuffled;
  };

  const handleDifficultyChange = (e) => {
    setSelectedDifficulty(e.target.value);
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

  useEffect(() => {
    const checkIfSolved = () => {
      if (pieces.length > 0) {
        return pieces.every((piece, index) => piece === correctOrder[index]);
      }
      return false;
    };

    setIsCorrect(checkIfSolved());
  }, [pieces, correctOrder]);

  const playSound = () => {
    const audio = new Audio('/sounds/success.mp3');
    audio.play().then(() => {
      setSoundPlayed(true); 
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }).catch((err) => {
      console.log('Audio play failed:', err); 
    });
  };

  return (
    <div className={`puzzle-container ${shake ? 'shake' : ''}`}>
      <h2>🧩 Puzzle</h2>
      <p>Place the pieces in the correct order!</p>

      <select value={selectedDifficulty} onChange={handleDifficultyChange}>
        <option value="easy">🟢 Easy</option>
        <option value="medium">🟡 Medium</option>
        <option value="hard">🔴 Hard</option>
      </select>

      <button 
        className="shuffle-button" 
        onClick={() => setPieces(getShuffled(pieces))} 
        disabled={isCorrect} 
      >
        🔁 Shuffle
      </button>

      {/* Show loading message if pieces are still being fetched */}
      {loading ? <p>Loading pieces...</p> : (
        <div className="puzzle-row">
          {pieces.map((piece, index) => (
            <img
              key={index}
              src={piece}
              alt={`piece${index}`}
              className="puzzle-piece"
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(index)}
            />
          ))}
        </div>
      )}

      {/* 🎊 Confetti in fixed position */}
      {isCorrect && (
        <div style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999, pointerEvents: 'none' }}>
          <Confetti width={width} height={height} />
        </div>
      )}

      {/* Success Message */}
      {isCorrect && (
        <div className="success-message">
          🎉 Congratulations! You completed the puzzle correctly!
        </div>
      )}

      {/* Button to trigger sound */}
      {!soundPlayed && isCorrect && (
        <button onClick={playSound}>Play Sound</button>
      )}
    </div>
  );
}

export default PuzzleActivity;


