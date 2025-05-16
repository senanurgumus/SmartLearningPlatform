
import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import './MatchSumActivity.css';
import matchQuestions from '../data/match_questions_full.json';
import { useParams } from 'react-router-dom';

const LEVELS = ['easy', 'medium', 'hard'];

function MatchSumActivity() {
  const { moduleId, activityId } = useParams();
  const [operation, setOperation] = useState('+');
  const [level, setLevel] = useState('easy');
  const [pairs, setPairs] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [matches, setMatches] = useState({});
  const [draggedAnswer, setDraggedAnswer] = useState(null);

  const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);

  const shuffleQuestionsAndAnswers = () => {
    const pool = matchQuestions[operation][level];
    const newPairs = shuffle(JSON.parse(JSON.stringify(pool))).slice(0, 5);
    setPairs(newPairs);
    setAnswers(shuffle(newPairs.map(p => p.answer)));
    setMatches({});
  };

  useEffect(() => {
    shuffleQuestionsAndAnswers();
  }, [operation, level]);

  // konfeti tetikle
  useEffect(() => {
    const allCorrect = pairs.length > 0 && pairs.every(p => matches[p.question] === p.answer);
    if (allCorrect) {
      confetti({ particleCount: 200, spread: 70, origin: { y: 0.6 } });
    }
  }, [matches, pairs]);

  const handleDragStart = ans => setDraggedAnswer(ans);
  const handleDragOver  = e => e.preventDefault();
  const handleDrop      = (question, e) => {
    e.preventDefault();
    const correct = pairs.find(p => p.question === question)?.answer;
    if (draggedAnswer !== correct) {
      alert('❌ Incorrect, try again!');
      return;
    }
    setMatches(m => ({ ...m, [question]: draggedAnswer }));
  };
  const handleDragEnter = e => {
    e.currentTarget
     .querySelector('.match-sum-activity__drop-target')
     .classList.add('match-sum-activity__drop-target--hovered');
  };
  const handleDragLeave = e => {
    e.currentTarget
     .querySelector('.match-sum-activity__drop-target')
     .classList.remove('match-sum-activity__drop-target--hovered');
  };

  const allCorrect = pairs.length > 0 && pairs.every(p => matches[p.question] === p.answer);

  const goToNextLevel = () => {
    const idx = LEVELS.indexOf(level);
    if (idx < LEVELS.length - 1) {
      setLevel(LEVELS[idx + 1]);
    }
  };

  return (
    <div className="match-sum-activity">
      <h2>{operation} Operation ({level.toUpperCase()})</h2>
      <p>Match the operations with the correct answers!</p>

      <div className="match-sum-activity__selectors">
        <select
          className="match-sum-activity__selector"
          value={operation}
          onChange={e => setOperation(e.target.value)}
        >
          <option value="+">➕ Addition</option>
          <option value="-">➖ Subtraction</option>
          <option value="×">✖️ Multiplication</option>
          <option value="÷">➗ Division</option>
        </select>
        <select
          className="match-sum-activity__selector"
          value={level}
          onChange={e => setLevel(e.target.value)}
        >
          <option value="easy">🟢 Easy</option>
          <option value="medium">🟠 Medium</option>
          <option value="hard">🔴 Hard</option>
        </select>
      </div>

      <div className="match-sum-activity__question-row">
        {pairs.map((pair, i) => (
          <div
            key={i}
            className="match-sum-activity__question-box"
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={e => handleDrop(pair.question, e)}
          >
            <strong>{pair.question}</strong>
            <div
              className={
                `match-sum-activity__drop-target${
                  matches[pair.question]
                    ? ' match-sum-activity__drop-target--matched'
                    : ''
                }`
              }
            >
              {matches[pair.question]
                ? matches[pair.question]
                : <span className="match-sum-activity__placeholder">Drag</span>
              }
            </div>
          </div>
        ))}
      </div>

      <div className="match-sum-activity__answers-row">
        {answers.map((ans, i) => (
          <div
            key={i}
            className="match-sum-activity__answer-box"
            draggable
            onDragStart={() => handleDragStart(ans)}
          >
            {ans}
          </div>
        ))}
      </div>

      {/* ► Shuffle butonu artık cevapların hemen altında */}
      <button
        className="match-sum-activity__shuffle-button"
        onClick={shuffleQuestionsAndAnswers}
      >
        🔄 Shuffle Questions
      </button>

      {allCorrect && (
        <div className="match-sum-activity__button-group">
          {/* Sadece Next Level */}
          {level !== 'hard' && (
            <button
              className="match-sum-activity__btn match-sum-activity__btn--secondary"
              onClick={goToNextLevel}
            >
              Next Level
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default MatchSumActivity;
