import React, { useState, useEffect } from 'react';
import './WordPuzzleActivity.css';
import Confetti from 'react-confetti';
import { useWindowSize } from '@react-hook/window-size';
import { wordPuzzleLevels } from '../data/wordPuzzleLevels.js';
import { db } from '../firebase.js';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

function WordPuzzleActivity() {
  const TIME_LIMIT = 10;

  const [currentLevel, setCurrentLevel] = useState('level1');
  const [shuffledWordList, setShuffledWordList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [draggedLetter, setDraggedLetter] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(null);
  const [width, height] = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [timerActive, setTimerActive] = useState(true);
  const [timeRecords, setTimeRecords] = useState([]);
  const [badges, setBadges] = useState([]);

  const currentLevelData = wordPuzzleLevels[currentLevel];
  const currentWordList = currentLevelData.words;
  const levelTitle = currentLevelData.title;

  const currentWord = shuffledWordList[currentIndex];
  const isLastWord = currentIndex === shuffledWordList.length - 1;

  const levelKeys = Object.keys(wordPuzzleLevels);
  const currentLevelIndex = levelKeys.indexOf(currentLevel);
  const nextLevelKey = levelKeys[currentLevelIndex + 1];

  const playSound = (src) => {
    const audio = new Audio(src);
    audio.play();
  };

  const shuffleAndPickAll = (levelKey) => {
    const list = wordPuzzleLevels[levelKey].words;
    const shuffled = [...list].sort(() => Math.random() - 0.5);
    setShuffledWordList(shuffled);
  };

  const handleDragStart = (letter) => {
    setDraggedLetter(letter);
    playSound(`/sounds/letters/${letter}.ogg`);
  };

  const handleDrop = () => {
    if (completed) return;

    if (draggedLetter === currentWord.word[currentWord.missingIndex]) {
      const timeUsed = TIME_LIMIT - timeLeft;
      setTimeRecords(prev => [...prev, timeUsed]);

      if (!completed && isCorrect !== true) setScore((prev) => prev + 1);
      playSound('/sounds/correct.mp3');
      setIsCorrect(true);
      setCompleted(true);
      setTimerActive(false);

      if (isLastWord) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 8000);
      } else {
        setTimeout(() => {
          setCurrentIndex((prev) => prev + 1);
          setIsCorrect(null);
          setCompleted(false);
          setDraggedLetter(null);
          setTimeLeft(TIME_LIMIT);
          setTimerActive(true);
        }, 2000);
      }
    } else {
      playSound('/sounds/wrong.mp3');
      setIsCorrect(false);
      setScore((prev) => (prev > 0 ? prev - 1 : 0));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleRestart = () => {
    shuffleAndPickAll(currentLevel);
    setCurrentIndex(0);
    setScore(0);
    setIsCorrect(null);
    setCompleted(false);
    setDraggedLetter(null);
    setShowConfetti(false);
    setTimeLeft(TIME_LIMIT);
    setTimerActive(true);
    setTimeRecords([]);
    setBadges([]);
  };

  const handleNextLevel = () => {
    if (!nextLevelKey) return;
    setCurrentLevel(nextLevelKey);
    shuffleAndPickAll(nextLevelKey);
    setCurrentIndex(0);
    setScore(0);
    setIsCorrect(null);
    setCompleted(false);
    setDraggedLetter(null);
    setShowConfetti(false);
    setTimeLeft(TIME_LIMIT);
    setTimerActive(true);
    fetchBestScore(nextLevelKey);
  };

  const handleLevelChange = (e) => {
    const level = e.target.value;
    setCurrentLevel(level);
    setScore(0);
    setCurrentIndex(0);
    setIsCorrect(null);
    setCompleted(false);
    setDraggedLetter(null);
    setShowConfetti(false);
    setTimeLeft(TIME_LIMIT);
    setTimerActive(true);
    shuffleAndPickAll(level);
    fetchBestScore(level);
    setTimeRecords([]);
    setBadges([]);
  };

  const saveScoreToFirebase = async (level, score) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

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

  const calculateBadges = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    const newBadges = [];
    const total = shuffledWordList.length;
    const averageTime = timeRecords.reduce((a, b) => a + b, 0) / timeRecords.length;

    if (score === total) newBadges.push({ emoji: '🥇', label: 'Perfect' });
    if (averageTime < 3) newBadges.push({ emoji: '⚡', label: 'Speedster' });

    const today = new Date().toISOString().split('T')[0];
    const userRef = doc(db, 'users', user.uid);
    const snapshot = await getDoc(userRef);
    const data = snapshot.exists() ? snapshot.data() : {};
    const logins = data.wordPuzzleLogins || [];
    const updatedLogins = Array.from(new Set([...logins, today])).sort().slice(-3);

    if (updatedLogins.length === 3) {
      const [d1, d2, d3] = updatedLogins.map(d => new Date(d));
      if (d2 - d1 === 86400000 && d3 - d2 === 86400000) {
        newBadges.push({ emoji: '📅', label: 'Daily Streak' });
      }
    }

    await updateDoc(userRef, {
      wordPuzzleBadges: newBadges,
      wordPuzzleLogins: updatedLogins
    });

    setBadges(newBadges);
  };

  useEffect(() => {
    shuffleAndPickAll(currentLevel);
    fetchBestScore(currentLevel);
  }, []);

  useEffect(() => {
    if (isLastWord && completed) {
      saveScoreToFirebase(currentLevel, score);
      calculateBadges();
    }
  }, [completed]);

  useEffect(() => {
    if (!completed && timerActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }

    if (timeLeft === 0 && !completed) {
      setIsCorrect(false);
      setCompleted(true);
      setScore((prev) => (prev > 0 ? prev - 1 : 0));
      setTimerActive(false);

      if (!isLastWord) {
        setTimeout(() => {
          setCurrentIndex((prev) => prev + 1);
          setIsCorrect(null);
          setCompleted(false);
          setDraggedLetter(null);
          setTimeLeft(TIME_LIMIT);
          setTimerActive(true);
        }, 2000);
      }
    }
  }, [timeLeft, completed, timerActive]);

  if (!currentWord) return null;

  return (
    <div className="wp-container">
      {showConfetti && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none' }}>
          <Confetti width={width} height={height} opacity={0.6} recycle={false} numberOfPieces={300} />
        </div>
      )}

      <div className="wp-options">
        {currentWord.options.map((letter, idx) => (
          <div key={idx} className="wp-letter-card" draggable onDragStart={() => handleDragStart(letter)}>
            {letter}
          </div>
        ))}
      </div>

      <div className="wp-game-area">
        <h2>{levelTitle}</h2>

        <div className="wp-level-select">
          <label>Select Level: </label>
          <select value={currentLevel} onChange={handleLevelChange}>
            {Object.keys(wordPuzzleLevels).map((level) => (
              <option key={level} value={level}>{wordPuzzleLevels[level].title}</option>
            ))}
          </select>
        </div>

        <p>Score: {score} / {shuffledWordList.length}</p>
        <p>⏳ Time Left: {timeLeft} seconds</p>
        {bestScore !== null && (
          <p>⭐ Best Score: {bestScore} / {currentWordList.length}</p>
        )}

        <div className="wp-word-box">
          {[...currentWord.word].map((char, idx) => (
            idx === currentWord.missingIndex ? (
              <div key={idx} className="wp-drop-zone" onDrop={handleDrop} onDragOver={handleDragOver}>
                {completed ? char : '_'}
              </div>
            ) : (
              <span key={idx}>{char}</span>
            )
          ))}
        </div>

        {isCorrect === true && <p className="wp-correct-msg">✅ Correct!</p>}
        {isCorrect === false && <p className="wp-wrong-msg">❌ Try again!</p>}

        {isLastWord && completed && (
          <div className="wp-result-section">
            <h3>🎉 Great job!</h3>
            <p>Your final score: {score} / {shuffledWordList.length}</p>

            {badges.length > 0 ? (
              <div className="wp-badge-section">
                <h4>🏅 Badges Earned:</h4>
                <ul className="wp-badge-list">
                  {badges.map((b, i) => (
                    <li key={i}>{b.emoji} {b.label}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <p>No badge earned this time.</p>
            )}

            <button className="wp-next-btn" onClick={handleRestart}>🔁 Play Again</button>
            {nextLevelKey && (
              <button className="wp-next-btn" onClick={handleNextLevel}>⏭️ Next Level</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default WordPuzzleActivity;
