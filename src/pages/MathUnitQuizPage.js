import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import mathQuiz from '../data/math_quiz.json';
import './QuizPage.css';

function MathUnitQuizPage() {
  const { unitId } = useParams(); // ex: addition_and_subtraction_operations
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (mathQuiz[unitId]) {
      const shuffled = [...mathQuiz[unitId]].sort(() => 0.5 - Math.random());
      setQuestions(shuffled.slice(0, 10));
    }
  }, [unitId]);

  const handleOptionClick = (i, option) => {
    if (!submitted) {
      setAnswers({ ...answers, [i]: option });
    }
  };

  const handleSubmit = () => {
    let correct = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.answer) correct++;
    });
    setScore(correct);
    setSubmitted(true);
  };

  const restartQuiz = () => {
    const shuffled = [...mathQuiz[unitId]].sort(() => 0.5 - Math.random());
    setQuestions(shuffled.slice(0, 10));
    setAnswers({});
    setSubmitted(false);
    setScore(0);
  };

  if (!questions.length) {
    return <p>Loading questions...</p>;
  }

  return (
    <div className="quiz-container">
      <h2>{unitId.replace(/_/g, ' ').toUpperCase()}</h2>

      {questions.map((q, i) => {
        const isCorrect = answers[i] === q.answer;
        const isAnswered = answers[i] !== undefined;
        let questionClass = '';

        if (submitted && isAnswered) {
          questionClass = isCorrect ? 'correct' : 'incorrect';
        }

        return (
          <div key={i} className={`question-block ${questionClass}`}>
            <h4>{i + 1}. {q.question}</h4>
            {q.options.map((opt, j) => {
              const isSelected = answers[i] === opt;
              return (
                <div
                  key={j}
                  className={`option ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleOptionClick(i, opt)}
                >
                  {opt}
                </div>
              );
            })}
            {submitted && !isCorrect && (
              <p className="correct-answer">✅ Correct answer: {q.answer}</p>
            )}
          </div>
        );
      })}

      {!submitted ? (
        <button className="submit-btn" onClick={handleSubmit}>Submit Quiz</button>
      ) : (
        <>
          <p className="score-display">Your score: {score} / {questions.length}</p>
          <button className="submit-btn" onClick={restartQuiz}>Try Again</button>
        </>
      )}
    </div>
  );
}

export default MathUnitQuizPage;
