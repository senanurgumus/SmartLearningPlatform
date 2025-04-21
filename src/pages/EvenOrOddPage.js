// EvenOrOddPage.js 🧮 Math Exercise: Even or Odd (bilgi popup + back button)
import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase.js';
import './EvenOrOddPage.css';
import { useNavigate } from 'react-router-dom';

const levels = [
  { id: 1, label: '1-Digit Numbers', min: 1, max: 9 },
  { id: 2, label: '2-Digit Numbers', min: 10, max: 99 },
  { id: 3, label: '3-Digit Numbers', min: 100, max: 999 },
  { id: 4, label: '4-Digit Numbers', min: 1000, max: 9999 }
];

const EvenOrOddPage = () => {
  const [user, setUser] = useState(null);
  const [level, setLevel] = useState(null);
  const [number, setNumber] = useState(null);
  const [score, setScore] = useState(0);
  const [bestScores, setBestScores] = useState({});
  const [feedback, setFeedback] = useState("");
  const [showInfo, setShowInfo] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const ref = doc(db, 'evenOddProgress', currentUser.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setBestScores(data.bestScores || {});
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const startLevel = (lvl) => {
    setLevel(lvl);
    setScore(0);
    setFeedback("");
    generateNumber(lvl);
  };

  const generateNumber = (lvl) => {
    const num = Math.floor(Math.random() * (lvl.max - lvl.min + 1)) + lvl.min;
    setNumber(num);
  };

  const checkAnswer = async (choice) => {
    const correct = (number % 2 === 0 && choice === 'even') || (number % 2 !== 0 && choice === 'odd');
    const newScore = correct ? score + 1 : score;
    setScore(newScore);
    setFeedback(correct ? '✅ Correct!' : '❌ Incorrect!');
    generateNumber(level);

    const currentBest = bestScores[level.id] || 0;
    if (newScore > currentBest && user) {
      const updatedScores = { ...bestScores, [level.id]: newScore };
      setBestScores(updatedScores);
      await setDoc(doc(db, 'evenOddProgress', user.uid), {
        userId: user.uid,
        bestScores: updatedScores
      });
    }
  };

  const toggleInfo = () => setShowInfo(!showInfo);

  return (
    <div className="even-odd-container">
      <h2 className="title">🧮 Even or Odd?</h2>

      <button className="help-button" onClick={toggleInfo}>❓</button>

      {showInfo && (
        <div className="popup-overlay">
          <div className="popup-content">
            <button className="close-button" onClick={toggleInfo}>✖</button>
            <h3>ℹ️ What are Even & Odd Numbers?</h3>
            <p>Even numbers can be divided by 2 with no remainder (like 2, 4, 6...)</p>
            <p>Odd numbers have a remainder of 1 when divided by 2 (like 1, 3, 5...)</p>
            <p>Try to guess if the number is even or odd to earn points!</p>
          </div>
        </div>
      )}

      {!level ? (
        <div className="level-select">
          <h3>Select a Level:</h3>
          {levels.map((lvl) => (
            <button
              key={lvl.id}
              onClick={() => startLevel(lvl)}
              className="level-button"
            >
              {lvl.label}
            </button>
          ))}
        </div>
      ) : (
        <div className="game-area">
          <p className="level-label">{level.label}</p>
          <p className="number-display">{number}</p>
          <div className="choices">
            <button onClick={() => checkAnswer('even')} className="choice-btn">Even</button>
            <button onClick={() => checkAnswer('odd')} className="choice-btn">Odd</button>
          </div>
          <p className="feedback">{feedback}</p>
          <p className="score">Score: {score} | Best: {bestScores[level.id] || 0}</p>
        </div>
      )}

      <div className="back-button-fixed">
        <button className="result-button" onClick={() => navigate('/module/math/exercises')}>
          🔙 Back to Exercises
        </button>
      </div>
    </div>
  );
};

export default EvenOrOddPage;
