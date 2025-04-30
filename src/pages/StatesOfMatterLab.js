import React, { useState, useEffect } from 'react';
import './StatesOfMatterLab.css';
import Confetti from 'react-confetti';
import { useWindowSize } from '@react-hook/window-size';

let audioPlayer = new Audio();

const playSound = (src) => {
  if (!src) return;
  audioPlayer.pause();
  audioPlayer.currentTime = 0;
  audioPlayer.src = src;
  audioPlayer.play();
};

const STATES = [
  { type: 'Solid', emoji: '🧊', description: 'Solids have a definite shape and volume.' },
  { type: 'Liquid', emoji: '💧', description: 'Liquids take the shape of their container but have a definite volume.' },
  { type: 'Gas', emoji: '💨', description: 'Gases have no fixed shape or volume. They fill the entire space available.' },
];

const QUESTIONS = [
  {
    question: 'What happens to ice when you heat it?',
    options: ['It turns to gas', 'It melts into liquid', 'It freezes more'],
    answer: 'It melts into liquid',
  },
  {
    question: 'Which state of matter has no fixed shape or volume?',
    options: ['Solid', 'Liquid', 'Gas'],
    answer: 'Gas',
  },
  {
    question: 'Cooling water turns it into:',
    options: ['Ice', 'Steam', 'Cloud'],
    answer: 'Ice',
  }
];

function StatesOfMatterLab() {
  const [showIntro, setShowIntro] = useState(true);
  const [stateIndex, setStateIndex] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [quizFinished, setQuizFinished] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [width, height] = useWindowSize();

  useEffect(() => {
    if (quizFinished) {
      playSound('/sounds/success.mp3');
    }
  }, [quizFinished]);

  const handleHeat = () => {
    if (stateIndex < 2) {
      const soundSrc = stateIndex === 0 ? '/sounds/liquid.mp3' : '/sounds/gas.mp3';
      playSound(soundSrc);
      setAnimating(true);
      setTimeout(() => {
        setStateIndex(prev => prev + 1);
        setAnimating(false);
      }, 300);
    }
  };

  const handleCool = () => {
    if (stateIndex > 0) {
      const soundSrc = stateIndex === 2 ? '/sounds/liquid.mp3' : '/sounds/solid.mp3';
      playSound(soundSrc);
      setAnimating(true);
      setTimeout(() => {
        setStateIndex(prev => prev - 1);
        setAnimating(false);
      }, 300);
    }
  };

  const startQuiz = () => {
    setShowQuiz(true);
  };

  const handleAnswer = (option) => {
    const current = QUESTIONS[quizIndex];
    if (option === current.answer) {
      setFeedback('✅ Great job!');
      setTimeout(() => {
        setFeedback('');
        if (quizIndex + 1 < QUESTIONS.length) {
          setQuizIndex(quizIndex + 1);
        } else {
          setQuizFinished(true);
        }
      }, 1000);
    } else {
      setFeedback('❌ Try again!');
      setTimeout(() => setFeedback(''), 1000);
    }
  };

  return (
    <div className="matter-lab-container">
      {showIntro ? (
        <>
          <h1>States of Matter</h1>
          <div className="states-grid">
            {STATES.map((state, index) => (
              <div key={index} className="state-card">
                <div className="emoji">{state.emoji}</div>
                <h2>{state.type}</h2>
                <p>{state.description}</p>
              </div>
            ))}
          </div>
          <button className="start-button" onClick={() => setShowIntro(false)}>
            Start the Lab 🔬
          </button>
        </>
      ) : !showQuiz ? (
        <>
          <h1>Change of State</h1>

          <div className="thermometer">
            <p className="temp-label">
              {stateIndex === 0 ? 'Cold ❄️' : stateIndex === 1 ? 'Warm 💧' : 'Hot 🔥'}
            </p>
            <div className={`thermo-indicator ${stateIndex === 0 ? 'cold' : stateIndex === 1 ? 'warm' : 'hot'}`}></div>
          </div>

          <div className={`main-state-display ${animating ? 'shrink' : 'grow'}`} key={stateIndex}>
            <div className="emoji big">{STATES[stateIndex].emoji}</div>
            <h2>{STATES[stateIndex].type}</h2>
            <p>{STATES[stateIndex].description}</p>
          </div>

          <div className="buttons-row">
            <button onClick={handleCool} disabled={stateIndex === 0}>❄️ Cool</button>
            <button onClick={handleHeat} disabled={stateIndex === 2}>🔥 Heat</button>
          </div>

          <button className="start-button" onClick={startQuiz} style={{ marginTop: '30px' }}>
            Take Quiz 🧠
          </button>
        </>
      ) : !quizFinished ? (
        <>
          <h1>Quiz Time!</h1>
          <div className="quiz-card">
            <p><strong>{QUESTIONS[quizIndex].question}</strong></p>
            <div className="options">
              {QUESTIONS[quizIndex].options.map((opt, i) => (
                <button key={i} onClick={() => handleAnswer(opt)}>{opt}</button>
              ))}
            </div>
            {feedback && <div className="feedback">{feedback}</div>}
          </div>
        </>
      ) : (
        <>
          <Confetti width={width} height={height} numberOfPieces={300} recycle={false} />
          <div className="completion-message">
            <h2>🎉 You finished the lab!</h2>
            <p>Great job exploring the states of matter!</p>

            <div className="end-buttons">
              <button className="end-button" onClick={() => {
                setShowIntro(true);
                setShowQuiz(false);
                setQuizFinished(false);
                setQuizIndex(0);
                setStateIndex(0);
              }}>
                🔁 Play Again
              </button>

              <button className="end-button" onClick={() => window.location.href = "/dashboard"}>
                🏠 Go to Home
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default StatesOfMatterLab;
