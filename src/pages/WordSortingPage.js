// WordSortingPage.js (auth yavaş geldiğinde kilit bozulmasını önler)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase.js';
import confetti from 'canvas-confetti';
import './WordSortingPage.css';

const wordBank = {
  1: [
    { word: "dog", type: "noun" },
    { word: "run", type: "verb" },
    { word: "happy", type: "adjective" },
    { word: "car", type: "noun" },
    { word: "jump", type: "verb" },
    { word: "fast", type: "adjective" }
  ],
  2: [
    { word: "pencil", type: "noun" },
    { word: "laugh", type: "verb" },
    { word: "soft", type: "adjective" },
    { word: "elephant", type: "noun" },
    { word: "build", type: "verb" },
    { word: "tall", type: "adjective" }
  ],
  3: [
    { word: "teacher", type: "noun" },
    { word: "paint", type: "verb" },
    { word: "bright", type: "adjective" },
    { word: "school", type: "noun" },
    { word: "clap", type: "verb" },
    { word: "colorful", type: "adjective" }
  ],
  4: [
    { word: "monkey", type: "noun" },
    { word: "climb", type: "verb" },
    { word: "funny", type: "adjective" },
    { word: "window", type: "noun" },
    { word: "slide", type: "verb" },
    { word: "quiet", type: "adjective" }
  ],
  5: [
    { word: "rocket", type: "noun" },
    { word: "launch", type: "verb" },
    { word: "shiny", type: "adjective" },
    { word: "puzzle", type: "noun" },
    { word: "think", type: "verb" },
    { word: "tricky", type: "adjective" }
  ]
};

const getRandomWords = (level) => {
  const words = wordBank[level] || [];
  const shuffled = [...words].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 6);
};

const WordSortingPage = () => {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [words, setWords] = useState([]);
  const [draggedWord, setDraggedWord] = useState(null);
  const [answers, setAnswers] = useState({ noun: [], verb: [], adjective: [] });
  const [score, setScore] = useState(0);
  const [bestScores, setBestScores] = useState({});
  const [unlockedLevel, setUnlockedLevel] = useState(1);
  const [showCongrats, setShowCongrats] = useState(false);
  const [showNextLevelButton, setShowNextLevelButton] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const ref = doc(db, 'wordSortingProgress', currentUser.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setBestScores(data.bestScores || {});
          setUnlockedLevel(data.unlockedLevel || 1);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const total = Object.values(answers).flat().length;
    if (selectedLevel && total === words.length && user) {
      const ref = doc(db, 'wordSortingProgress', user.uid);
      const maxScore = words.length;
      const isPerfect = score === maxScore;
      const newBestScores = { ...bestScores };
      let newUnlocked = unlockedLevel;

      if (!newBestScores[selectedLevel] || score > newBestScores[selectedLevel]) {
        newBestScores[selectedLevel] = score;
        setBestScores(newBestScores);
        setShowCongrats(true);
        confetti({ particleCount: 200, spread: 70, origin: { y: 0.6 } });
      }

      if (isPerfect && selectedLevel === unlockedLevel && unlockedLevel < Object.keys(wordBank).length) {
        newUnlocked = unlockedLevel + 1;
        setUnlockedLevel(newUnlocked);
        setShowNextLevelButton(true);
      }

      setDoc(ref, {
        userId: user.uid,
        bestScores: newBestScores,
        unlockedLevel: newUnlocked
      });
    }
  }, [answers, score, user, selectedLevel, words.length, unlockedLevel, bestScores]);

  const handleDrop = (category) => {
    if (!draggedWord) return;
    const isCorrect = draggedWord.type === category;
    if (isCorrect) {
      setAnswers((prev) => ({ ...prev, [category]: [...prev[category], draggedWord.word] }));
      setScore((prev) => prev + 1);
    } else {
      setScore((prev) => Math.max(prev - 1, 0));
    }
    setDraggedWord(null);
  };

  const isWordUsed = (word) => Object.values(answers).flat().includes(word);

  const startLevel = (level) => {
    setSelectedLevel(level);
    setWords(getRandomWords(level));
    setAnswers({ noun: [], verb: [], adjective: [] });
    setScore(0);
    setShowCongrats(false);
    setShowNextLevelButton(false);
  };

  const restartGame = () => {
    if (selectedLevel) {
      startLevel(selectedLevel);
    }
  };

  const goToNextLevel = () => {
    const nextLevel = selectedLevel + 1;
    if (nextLevel <= Object.keys(wordBank).length) {
      startLevel(nextLevel);
    }
  };

  const allWordsSorted = Object.values(answers).flat().length === words.length;
  const bestScoreForCurrent = bestScores[selectedLevel] || 0;
  const isPerfectScore = score === words.length;

  return (
    <div className="word-sorting-container">
      <h2 className="title">🧩 Word Sorting Game</h2>

      {!selectedLevel ? (
        <div className="level-selection">
          <h3 className="subtitle">Select a Level:</h3>
          <div className="level-buttons">
            {user && Object.keys(wordBank).map((level) => {
              const isLocked = parseInt(level) > unlockedLevel;
              return (
                <button
                  key={level}
                  className={`result-button ${isLocked ? 'locked' : ''}`}
                  onClick={() => !isLocked && startLevel(Number(level))}
                  disabled={isLocked}
                >
                  {isLocked ? `🔒 Level ${level}` : `Level ${level}`}
                </button>
              );
            })}
          </div>
        </div>
      ) : !allWordsSorted ? (
        <>
          <p className="subtitle">Drag each word into the correct category</p>

          <div className="word-list">
            {words.map(({ word, type }) => (
              !isWordUsed(word) && (
                <div
                  key={word}
                  className="draggable-word"
                  draggable
                  onDragStart={() => setDraggedWord({ word, type })}
                >
                  {word}
                </div>
              )
            ))}
          </div>

          <div className="categories">
            {['noun', 'verb', 'adjective'].map((cat) => (
              <div
                key={cat}
                className="category-box"
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(cat)}
              >
                <h3 className="category-title">{cat.toUpperCase()}</h3>
                <div className="dropped-words">
                  {answers[cat].map((word, idx) => (
                    <span key={idx} className="word-chip">{word}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="score-box">Score: {score} | Best: {bestScoreForCurrent}</div>
        </>
      ) : (
        <div className="result-box">
          <h3 className="result-title">🎉 Well done!</h3>
          <p className="result-score">Your Score: <b>{score}</b></p>
          <p className="result-score">Best Score: <b>{bestScoreForCurrent}</b></p>
          {showCongrats && (
            <div className="popup-box">
              <p className="popup-message">🎊 Congratulations! You reached new high score!</p>
            </div>
          )}
          <div className="result-buttons">
            <button className="result-button" onClick={restartGame}>🔁 Play Again</button>
            <button className="result-button" onClick={() => navigate('/module/english/exercises')}>🔙 Back to Exercises</button>
            {isPerfectScore && showNextLevelButton && (
              <button className="result-button" onClick={goToNextLevel}>➡️ Go to Next Level</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WordSortingPage;