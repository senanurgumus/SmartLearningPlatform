
import React, { useState, useEffect } from 'react';
import './WordPuzzleActivity.css';
import Confetti from 'react-confetti';
import { useWindowSize } from '@react-hook/window-size';
import { wordPuzzleLevels } from '../data/wordPuzzleLevels.js';
import { db } from '../firebase.js';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

function WordPuzzleActivity() {
  const [currentLevel, setCurrentLevel] = useState('level1');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [draggedLetter, setDraggedLetter] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(null);
  const [width, height] = useWindowSize();

  const currentWordList = wordPuzzleLevels[currentLevel];
  const currentWord = currentWordList[currentIndex];
  const isLastWord = currentIndex === currentWordList.length - 1;

  const playSound = (src) => {
    const audio = new Audio(src);
    audio.play();
  };

  const handleDragStart = (letter) => {
    setDraggedLetter(letter);
    playSound(`/sounds/letters/${letter}.ogg`);
  };

  const handleDrop = () => {
    if (completed) return;

    if (draggedLetter === currentWord.word[currentWord.missingIndex]) {
      if (!completed && isCorrect !== true) {
        setScore((prev) => prev + 1);
      }
      playSound('/sounds/correct.mp3');
      setIsCorrect(true);
      setCompleted(true);
    } else {
      playSound('/sounds/wrong.mp3');
      setIsCorrect(false);
      setScore((prev) => (prev > 0 ? prev - 1 : 0));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleNext = () => {
    if (currentIndex < currentWordList.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsCorrect(null);
      setCompleted(false);
      setDraggedLetter(null);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setScore(0);
    setIsCorrect(null);
    setCompleted(false);
    setDraggedLetter(null);
  };

  const handleLevelChange = (e) => {
    const level = e.target.value;
    setCurrentLevel(level);
    setCurrentIndex(0);
    setScore(0);
    setIsCorrect(null);
    setCompleted(false);
    setDraggedLetter(null);
    fetchBestScore(level);
  };

  const saveScoreToFirebase = async (level, score) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        console.warn('No user logged in.');
        return;
      }

      const userRef = doc(db, 'users', user.uid);
      const snapshot = await getDoc(userRef);

      const existingScores = snapshot.exists() ? snapshot.data().wordPuzzleScores || {} : {};
      const previous = existingScores[level] || 0;

      if (score > previous) {
        await setDoc(userRef, {
          wordPuzzleScores: {
            ...existingScores,
            [level]: score
          }
        }, { merge: true });
        setBestScore(score);
        console.log('Score saved ✅');
      } else {
        console.log('Score not higher than existing, not saved ❌');
      }
    } catch (error) {
      console.error('Error saving score:', error);
    }
  };

  const fetchBestScore = async (level) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, 'users', user.uid);
      const snapshot = await getDoc(userRef);
      const data = snapshot.exists() ? snapshot.data() : {};
      const scoreMap = data.wordPuzzleScores || {};
      setBestScore(scoreMap[level] || 0);
    } catch (err) {
      console.error('Failed to fetch best score:', err);
    }
  };

  useEffect(() => {
    fetchBestScore(currentLevel);
  }, []);

  useEffect(() => {
    if (isLastWord && completed) {
      saveScoreToFirebase(currentLevel, score);
    }
  }, [completed]);

  return (
    <div className="puzzle-container">
      <div className="options">
        {currentWord.options.map((letter, idx) => (
          <div
            key={idx}
            className="letter-card"
            draggable
            onDragStart={() => handleDragStart(letter)}
          >
            {letter}
          </div>
        ))}
      </div>

      <div className="game-area">
        <h2>Word Puzzle Game</h2>

        <div className="level-select">
          <label>Select Level: </label>
          <select value={currentLevel} onChange={handleLevelChange}>
            <option value="level1">Level 1</option>
            <option value="level2">Level 2</option>
            <option value="level3">Level 3</option>
          </select>
        </div>

        <p>Score: {score} / {currentWordList.length}</p>
        {bestScore !== null && <p>⭐ Your Best Score: {bestScore} / {currentWordList.length}</p>}

        <div className="word-box">
          {[...currentWord.word].map((char, idx) => (
            idx === currentWord.missingIndex ? (
              <div
                key={idx}
                className="drop-zone"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                {completed ? char : '_'}
              </div>
            ) : (
              <span key={idx}>{char}</span>
            )
          ))}
        </div>

        {isCorrect === true && <p className="correct-msg">✅ Correct!</p>}
        {isCorrect === false && <p className="wrong-msg">❌ Try again!</p>}

        {completed && !isLastWord && (
          <button className="next-btn" onClick={handleNext}>➡️ Next</button>
        )}

        {isLastWord && completed && (
          <>
            <Confetti width={width} height={height} />
            <div className="result-section">
              <h3>🎉 Great job!</h3>
              <p>Your final score: {score} / {currentWordList.length}</p>
              <button className="next-btn" onClick={handleRestart}>🔁 Restart</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default WordPuzzleActivity;