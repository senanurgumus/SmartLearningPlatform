import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MathDiceGamePage.css';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase.js';

const getRandomDice = () => Math.floor(Math.random() * 6) + 1;
const getRandomOperator = () => ['+', '-', '×', '÷'][Math.floor(Math.random() * 4)];

const calculateAnswer = (a, b, op) => {
  switch (op) {
    case '+': return a + b;
    case '-': return a - b;
    case '×': return a * b;
    case '÷':
      return b === 0 ? 0 : a % b === 0 ? a / b : `${a}/${b}`;
    default: return a + b;
  }
};

const getOptions = (correct, op) => {
  const options = new Set([correct]);
  while (options.size < 3) {
    if (op === '÷' && typeof correct === 'string') {
      const randNum = Math.floor(Math.random() * 6) + 1;
      const wrong = `${randNum}/${Math.floor(Math.random() * 5) + 1}`;
      if (wrong !== correct) options.add(wrong);
    } else {
      const rand = parseInt(correct) + Math.floor(Math.random() * 5) - 2;
      options.add(rand);
    }
  }
  return [...options].sort(() => 0.5 - Math.random());
};

const messages = [
  "You're on fire! 🔥",
  "Keep going, genius! 🧠",
  "Amazing job! 🌟",
  "Unstoppable! 💪",
  "Fantastic work! 🎉"
];

const MathDiceGamePage = () => {
  const [dice1, setDice1] = useState(1);
  const [dice2, setDice2] = useState(1);
  const [rolling, setRolling] = useState(true);
  const [operator, setOperator] = useState('+');
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [showPopup, setShowPopup] = useState(true);
  const [popupMessage, setPopupMessage] = useState('');
  const [user, setUser] = useState(null);
  const [showInstruction, setShowInstruction] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const ref = doc(db, 'mathDiceProgress', currentUser.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setBestScore(snap.data().bestScore || 0);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const rollDice = () => {
    setRolling(true);
    setFeedback('');
    setTimeout(() => {
      const d1 = getRandomDice();
      const d2 = getRandomDice();
      const op = getRandomOperator();
      const answer = calculateAnswer(d1, d2, op);
      setDice1(d1);
      setDice2(d2);
      setOperator(op);
      setOptions(getOptions(answer, op));
      setRolling(false);
    }, 1000);
  };

  const handleAnswer = async (choice) => {
    if (showPopup || showInstruction) return;
    const correct = calculateAnswer(dice1, dice2, operator);
    const isCorrect = choice === correct || choice.toString() === correct.toString();

    if (isCorrect) {
      const newScore = score + 1;
      setScore(newScore);
      setFeedback('✅ Correct!');
      if (newScore > bestScore && user) {
        setBestScore(newScore);
        await setDoc(doc(db, 'mathDiceProgress', user.uid), {
          userId: user.uid,
          bestScore: newScore
        });
      }
      if (newScore % 10 === 0) {
        setPopupMessage(messages[Math.floor(Math.random() * messages.length)]);
        setShowPopup(true);
        return;
      }
    } else {
      setScore(0);
      setFeedback(`❌ Wrong! The correct answer was ${correct}`);
    }
    setTimeout(rollDice, 1200);
  };

  useEffect(() => {
    if (!showInstruction) {
      rollDice();
    }
  }, [showInstruction]);

  const closePopup = () => {
    setShowPopup(false);
    setShowInstruction(false);
    rollDice();
  };

  return (
    <div className="dice-game-container">
      <h2 className="dice-game-title">🎲 Dice Math Challenge</h2>

      <div className="dice-images">
        {rolling ? (
          <>
            <img src="/dice/dice-rolling.gif" alt="Rolling" className="dice-img" />
            <span className="dice-operator">?</span>
            <img src="/dice/dice-rolling.gif" alt="Rolling" className="dice-img" />
          </>
        ) : (
          <>
            <img src={`/dice/dice${dice1}.png`} alt={`Dice ${dice1}`} className="dice-img" />
            <span className="dice-operator">{operator}</span>
            <img src={`/dice/dice${dice2}.png`} alt={`Dice ${dice2}`} className="dice-img" />
          </>
        )}
      </div>

      {!rolling && !showPopup && !showInstruction && (
        <div className="options">
          {options.map((opt, idx) => (
            <button key={idx} onClick={() => handleAnswer(opt)} className="option-button">
              {opt}
            </button>
          ))}
        </div>
      )}

      <div className="score-info">
        <p>⭐ Score: {score}</p>
        <p>🏆 Best Score: {bestScore}</p>
        <p>{feedback}</p>
      </div>

      <div className="back-button-area">
        <button className="result-button" onClick={() => navigate('/module/math/exercises')}>
          🔙 Back to Math Exercises
        </button>
      </div>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <button className="close-button" onClick={closePopup}>✖</button>
            <p className="popup-message">{popupMessage}</p>
          </div>
        </div>
      )}

      {showInstruction && (
        <div className="popup-overlay">
          <div className="popup-content">
            <button className="close-button" onClick={closePopup}>✖</button>
            <h3>How to Play</h3>
            <p>🎲 Roll the dice and solve the math problem using the shown operator.</p>
            <p>➕ ➖ ✖️ ➗ — Watch out for division! If the result is not a whole number, the correct answer will be shown as a fraction (e.g., <strong>5/2</strong>).</p>
            <p>💡 Every 10 points, a surprise motivational message will appear!</p>
            <p>Can you beat your best score?</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MathDiceGamePage;
