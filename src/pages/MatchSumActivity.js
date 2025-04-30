
import React, { useState, useEffect } from 'react';
import './MatchSumActivity.css';
import matchQuestions from '../data/match_questions_full.json';
import { useParams } from 'react-router-dom';

function MatchSumActivity() {
  const { moduleId } = useParams(); // This will get the moduleId from the URL
  const { activityId } = useParams(); // This will get the activityId from the URL
  const [operation, setOperation] = useState('+');
  const [level, setLevel] = useState('easy');
  const [pairs, setPairs] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [matches, setMatches] = useState({});
  const [draggedAnswer, setDraggedAnswer] = useState(null);

  useEffect(() => {
    // You can use the moduleId and activityId to fetch specific data related to the activity
  }, [moduleId, activityId]);

  useEffect(() => {
    const questionPool = matchQuestions[operation][level];
    const newPairs = shuffle(JSON.parse(JSON.stringify(questionPool))).slice(0, 5);
    setPairs(newPairs);
    setAnswers(shuffle(newPairs.map(p => p.answer)));
    setMatches({});
  }, [operation, level]);

  const shuffle = (array) => [...array].sort(() => Math.random() - 0.5);

  const handleDragStart = (answer) => {
    setDraggedAnswer(answer);
  };

  const handleDrop = (question) => {
    const correctAnswer = pairs.find(p => p.question === question)?.answer;
    if (draggedAnswer !== correctAnswer) {
      alert('❌ Bu eşleştirme yanlış! Tekrar dene.');
      return;
    }
    setMatches(prev => ({ ...prev, [question]: draggedAnswer }));
  };

  const handleDragOver = (e) => e.preventDefault();

  const allCorrect = pairs.length > 0 && pairs.every(p => matches[p.question] === p.answer);

  return (
    <div className="match-container">
      <h2>{operation} İşlemi ({level.toUpperCase()})</h2>
      <p>İşlemleri doğru sonuçlarla eşleştir!</p>

      <div className="selectors">
        <select value={operation} onChange={(e) => setOperation(e.target.value)}>
          <option value="+">➕ Toplama</option>
          <option value="-">➖ Çıkarma</option>
          <option value="×">✖️ Çarpma</option>
          <option value="÷">➗ Bölme</option>
        </select>

        <select value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="easy">🟢 Kolay</option>
          <option value="medium">🟠 Orta</option>
          <option value="hard">🔴 Zor</option>
        </select>
      </div>

      <div className="question-row">
        {pairs.map((pair, index) => (
          <div
            key={index}
            className="question-box"
            onDrop={() => handleDrop(pair.question)}
            onDragOver={handleDragOver}
          >
            <strong>{pair.question}</strong>
            <div className="drop-target">
              {matches[pair.question] ? (
                <span className="matched">{matches[pair.question]}</span>
              ) : (
                <span className="placeholder">Sürükle</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="answers-row">
        {answers.map((ans, i) => (
          <div
            key={i}
            className="answer-box"
            draggable
            onDragStart={() => handleDragStart(ans)}
          >
            {ans}
          </div>
        ))}
      </div>

      {allCorrect && (
        <div className="success-message">
          🎉 Tebrikler! Hepsini doğru eşleştirdin!
        </div>
      )}
    </div>
  );
}

export default MatchSumActivity;
