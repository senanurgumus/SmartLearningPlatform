import React, { useState, useEffect } from 'react';
import './PhonicsPopActivity.css';

const phonicsData = [
  {
    letter: 'C',
    options: [
      { label: 'Cat', image: '🐱', correct: true },
      { label: 'Apple', image: '🍎', correct: false },
      { label: 'Car', image: '🚗', correct: true },
      { label: 'Dog', image: '🐶', correct: false }
    ]
  },
  {
    letter: 'B',
    options: [
      { label: 'Ball', image: '⚽', correct: true },
      { label: 'Banana', image: '🍌', correct: true },
      { label: 'Fish', image: '🐟', correct: false },
      { label: 'Chair', image: '🪑', correct: false }
    ]
  }
];

function PhonicPopActivity() {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [popped, setPopped] = useState([]);

  const current = phonicsData[round];

  const handlePop = (index) => {
    if (popped.includes(index)) return;
    setPopped([...popped, index]);
    if (current.options[index].correct) {
      setScore(score + 1);
    }
  };

  const nextRound = () => {
    setRound((prev) => (prev + 1) % phonicsData.length);
    setPopped([]);
  };

  return (
    <div className="phonics-container">
      <h2>Phonics Pop!</h2>
      <p>Tap the objects that start with:</p>
      <div className="target-letter">{current.letter}</div>

      <div className="balloon-area">
        {current.options.map((item, idx) => (
          <div
            key={`${round}-${idx}`} // 💡 round da eklendi
            className={`balloon ${popped.includes(idx) ? 'popped' : ''}`}
            onClick={() => handlePop(idx)}
            style={{
                animationDelay: `${idx * 0.5}s`,
                left: `${20 + idx * 20}%`, // farklı konumlar
              }}
          >
            <span className="emoji">{item.image}</span>
            <span className="label">{item.label}</span>
          </div>
        ))}
      </div>

      <div className="score-box">Score: {score}</div>
      <button className="next-btn" onClick={nextRound}>Next Letter ➡️</button>
    </div>
  );
}

export default PhonicsPopActivity;
