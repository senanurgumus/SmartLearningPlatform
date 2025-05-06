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
  { question: 'What happens to ice when you heat it?', options: ['It turns to gas', 'It melts into liquid', 'It freezes more'], answer: 'It melts into liquid' },
  { question: 'Which state of matter has no fixed shape or volume?', options: ['Solid', 'Liquid', 'Gas'], answer: 'Gas' },
  { question: 'Cooling water turns it into:', options: ['Ice', 'Steam', 'Cloud'], answer: 'Ice' },
  { question: 'What is the boiling point of water?', options: ['100°C', '0°C', '50°C'], answer: '100°C' },
  { question: 'Which state of matter has a definite volume but no definite shape?', options: ['Solid', 'Liquid', 'Gas'], answer: 'Liquid' },
  { question: 'What happens to water when it freezes?', options: ['It turns to gas', 'It turns to liquid', 'It turns to solid'], answer: 'It turns to solid' },
  { question: 'Which of these is an example of a gas?', options: ['Oxygen', 'Water', 'Ice'], answer: 'Oxygen' },
  { question: 'What happens when a gas is cooled?', options: ['It turns into a solid', 'It turns into a liquid', 'It remains unchanged'], answer: 'It turns into a liquid' },
  { question: 'What is the solid form of water called?', options: ['Ice', 'Water vapor', 'Steam'], answer: 'Ice' },
  { question: 'Which of these states of matter can flow?', options: ['Solid', 'Liquid', 'Gas'], answer: 'Liquid' }
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
  const [currentBatch, setCurrentBatch] = useState(0);

  const BATCH_SIZE = 5;
  const totalBatches = Math.ceil(QUESTIONS.length / BATCH_SIZE);
  const currentQuestions = QUESTIONS.slice(currentBatch * BATCH_SIZE, currentBatch * BATCH_SIZE + BATCH_SIZE);

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
    const current = currentQuestions[quizIndex % BATCH_SIZE];
    if (option === current.answer) {
      setFeedback('✅ Great job!');
      setTimeout(() => {
        setFeedback('');
        const isLastInBatch = (quizIndex % BATCH_SIZE) === BATCH_SIZE - 1;
        const isLastQuestion = quizIndex + 1 === QUESTIONS.length;

        if (!isLastInBatch && !isLastQuestion) {
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

  const handleNextBatch = () => {
    setShowQuiz(true);
    setQuizFinished(false);
    setQuizIndex((currentBatch + 1) * BATCH_SIZE);
    setCurrentBatch(currentBatch + 1);
  };

  return (
    <div className="som-container">
      {showIntro ? (
        <>
          <h1>States of Matter</h1>
          <div className="som-states-grid">
            {STATES.map((state, index) => (
              <div key={index} className="som-state-card">
                <div className="som-emoji">{state.emoji}</div>
                <h2>{state.type}</h2>
                <p>{state.description}</p>
              </div>
            ))}
          </div>
          <button className="som-start-button" onClick={() => setShowIntro(false)}>
            Start the Lab 🔬
          </button>
        </>
      ) : !showQuiz ? (
        <>
          <h1>Change of State</h1>
          <div className="som-thermometer">
            <p className="som-temp-label">
              {stateIndex === 0 ? 'Cold ❄️' : stateIndex === 1 ? 'Warm 💧' : 'Hot 🔥'}
            </p>
            <div className={`som-thermo-indicator ${stateIndex === 0 ? 'cold' : stateIndex === 1 ? 'warm' : 'hot'}`}></div>
          </div>
          <div className={`som-main-state-display ${animating ? 'som-shrink' : 'som-grow'}`} key={stateIndex}>
            <div className="som-emoji big">{STATES[stateIndex].emoji}</div>
            <h2>{STATES[stateIndex].type}</h2>
            <p>{STATES[stateIndex].description}</p>
          </div>
          <div className="som-buttons-row">
            <button onClick={handleCool} disabled={stateIndex === 0}>❄️ Cool</button>
            <button onClick={handleHeat} disabled={stateIndex === 2}>🔥 Heat</button>
          </div>
          <button className="som-start-button" onClick={startQuiz} style={{ marginTop: '30px' }}>
            Take Quiz 🧠
          </button>
        </>
      ) : !quizFinished ? (
        <>
          <h1>Quiz Time! (Set {currentBatch + 1})</h1>
          <div className="som-quiz-card">
            <p><strong>{currentQuestions[quizIndex % BATCH_SIZE].question}</strong></p>
            <div className="som-options">
              {currentQuestions[quizIndex % BATCH_SIZE].options.map((opt, i) => (
                <button key={i} onClick={() => handleAnswer(opt)}>{opt}</button>
              ))}
            </div>
            {feedback && <div className="som-feedback">{feedback}</div>}
          </div>
        </>
      ) : (
        <>
          <div className="som-confetti-container">
            <Confetti width={width} height={height} numberOfPieces={300} recycle={false} />
          </div>
          <div className="som-completion-message">
            <h2>🎉 You finished the quiz set!</h2>
            <p>Great job exploring the states of matter!</p>
            <div className="som-end-buttons">
              {currentBatch + 1 < totalBatches && (
                <button className="som-end-button" onClick={handleNextBatch}>
                  🔁 Another Quiz
                </button>
              )}
              <button className="som-end-button" onClick={() => window.location.href = "/module/science/activities"}>
                🏠 Go to Activities
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default StatesOfMatterLab;
