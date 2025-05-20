import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import './MatchSumActivity.css';
import matchQuestions from '../data/match_questions_full.json';
import { useParams } from 'react-router-dom';

const LEVELS = ['easy', 'medium', 'hard'];

function MatchSumActivity() {
  const { moduleId, activityId } = useParams();

  // Format route-based ID to a human-readable title, with fallback
  const formatTitle = (id) => {
    if (typeof id !== 'string' || id.trim() === '') {
      return 'Match Activity';
    }
    return id
      .split(/[-_]/g)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  const activityTitle = formatTitle(activityId);

  // Audio refs
  const correctAudio = useRef(new Audio('/sounds/correct.mp3'));
  const wrongAudio = useRef(new Audio('/sounds/wrong.mp3'));
  const successAudio = useRef(new Audio('/sounds/success.mp3'));

  const [operation, setOperation] = useState('+');
  const [level, setLevel] = useState('easy');
  const [pairs, setPairs] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [matches, setMatches] = useState({});
  const [draggedAnswer, setDraggedAnswer] = useState(null);

  const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

  const shuffleQuestionsAndAnswers = () => {
    const pool = matchQuestions[operation]?.[level] || [];
    const newPairs = shuffle(JSON.parse(JSON.stringify(pool))).slice(0, 5);
    setPairs(newPairs);
    setAnswers(shuffle(newPairs.map((p) => p.answer)));
    setMatches({});
  };

  useEffect(() => {
    shuffleQuestionsAndAnswers();
  }, [operation, level]);

  // Trigger confetti + success sound when all matches are correct
  useEffect(() => {
    const allCorrect =
      pairs.length > 0 && pairs.every((p) => matches[p.question] === p.answer);
    if (allCorrect) {
      successAudio.current.play();
      confetti({ particleCount: 200, spread: 70, origin: { y: 0.6 } });
    }
  }, [matches, pairs]);

  const handleDragStart = (ans) => setDraggedAnswer(ans);
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (question, e) => {
    e.preventDefault();
    const correct = pairs.find((p) => p.question === question)?.answer;
    if (draggedAnswer !== correct) {
      wrongAudio.current.play();
      return;
    }
    correctAudio.current.play();
    setMatches((m) => ({ ...m, [question]: draggedAnswer }));
  };
  const handleDragEnter = (e) => {
    e.currentTarget
      .querySelector('.match-sum-activity__drop-target')
      .classList.add('match-sum-activity__drop-target--hovered');
  };
  const handleDragLeave = (e) => {
    e.currentTarget
      .querySelector('.match-sum-activity__drop-target')
      .classList.remove('match-sum-activity__drop-target--hovered');
  };

  const allCorrect =
    pairs.length > 0 && pairs.every((p) => matches[p.question] === p.answer);

  const goToNextLevel = () => {
    const idx = LEVELS.indexOf(level);
    if (idx < LEVELS.length - 1) {
      setLevel(LEVELS[idx + 1]);
    }
  };

  return (
    <div className="match-sum-activity">
      <h2 className="match-sum-activity__title">{activityTitle}</h2>
      <p className="match-sum-activity__subtitle">
        Match the operations with the correct answers!
      </p>

      {/* All interactive elements in one card */}
      <div className="match-sum-activity__card">
        {/* Operation & difficulty selectors */}
        <div className="match-sum-activity__selectors">
          <select
            className="match-sum-activity__selector"
            value={operation}
            onChange={(e) => setOperation(e.target.value)}
          >
            <option value="+">➕ Addition</option>
            <option value="-">➖ Subtraction</option>
            <option value="×">✖️ Multiplication</option>
            <option value="÷">➗ Division</option>
          </select>
          <select
            className="match-sum-activity__selector"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
          >
            <option value="easy">🟢 Easy</option>
            <option value="medium">🟠 Medium</option>
            <option value="hard">🔴 Hard</option>
          </select>
        </div>

        {/* Question boxes */}
        <div className="match-sum-activity__question-row">
          {pairs.map((pair, i) => (
            <div
              key={i}
              className="match-sum-activity__question-box"
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(pair.question, e)}
            >
              <strong>{pair.question}</strong>
              <div
                className={`match-sum-activity__drop-target${
                  matches[pair.question]
                    ? ' match-sum-activity__drop-target--matched'
                    : ''
                }`}
              >
                {matches[pair.question] ? (
                  matches[pair.question]
                ) : (
                  <span className="match-sum-activity__placeholder">Drag</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Answer boxes */}
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

        {/* Shuffle & Next Level buttons */}
        <button
          className="match-sum-activity__shuffle-button"
          onClick={shuffleQuestionsAndAnswers}
        >
          🔄 Shuffle Questions
        </button>
        {allCorrect && level !== 'hard' && (
          <button
            className="match-sum-activity__btn match-sum-activity__btn--secondary"
            onClick={goToNextLevel}
          >
            Next Level
          </button>
        )}
      </div>
    </div>
  );
}

export default MatchSumActivity;
