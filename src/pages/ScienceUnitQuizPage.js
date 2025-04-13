import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import scienceQuiz from '../data/science_quiz.json';
import './QuizPage.css';
import { db, app } from '../firebase.js';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

function ScienceUnitQuizPage() {
  const { unitId: unit } = useParams();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [userId, setUserId] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupEmoji, setPopupEmoji] = useState('');
  const [showWarningPopup, setShowWarningPopup] = useState(false);

  const emojis = ['🎉', '🌟', '👏', '😊', '🍭', '🧁', '🐞'];

  const messages = [
    'Great job!',
    'You are a star!',
    'Keep it up!',
    'Amazing effort!',
    'Super smart!',
    'Fantastic work!',
    'Bravo!'
  ];

  useEffect(() => {
    if (!unit) return;
    const data = scienceQuiz[unit];

    if (Array.isArray(data)) {
      const shuffled = [...data].sort(() => 0.5 - Math.random());
      setQuestions(shuffled.slice(0, 10));
    } else {
      console.error('Invalid or missing unit in science_quiz.json:', unit);
    }
  }, [unit]);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setUserId(user.uid);
    });
    return () => unsubscribe();
  }, []);

  const handleOptionClick = (i, option) => {
    if (!submitted) {
      setAnswers({ ...answers, [i]: option });
    }
  };

  const handleSubmit = async () => {
    const unanswered = questions.findIndex((_, i) => answers[i] === undefined);
    if (unanswered !== -1) {
      setShowWarningPopup(true);
      return;
    }

    let correct = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.answer) correct++;
    });

    setScore(correct);
    setSubmitted(true);
    setPopupMessage(messages[Math.floor(Math.random() * messages.length)]);
    setPopupEmoji(emojis[Math.floor(Math.random() * emojis.length)]);
    setShowPopup(true);

    if (userId) {
      try {
        await addDoc(collection(db, 'quizResults'), {
          userId,
          score: correct,
          total: questions.length,
          module: 'science',
          unitId: unit,
          timestamp: Timestamp.now()
        });
      } catch (error) {
        console.error('Error saving result to Firestore:', error);
      }
    }
  };

  const restartQuiz = () => {
    const shuffled = [...scienceQuiz[unit]].sort(() => 0.5 - Math.random());
    setQuestions(shuffled.slice(0, 10));
    setAnswers({});
    setSubmitted(false);
    setScore(0);
    setShowPopup(false);
  };

  if (!questions.length) return <p>Loading questions...</p>;

  return (
    <div className="quiz-container">
      {submitted && (
        <div className="fixed-score">Score: {score} / {questions.length}</div>
      )}

      <h2>{unit.replace(/_/g, ' ').toUpperCase()}</h2>

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
        <button className="submit-btn" onClick={restartQuiz}>Try Again</button>
      )}

      {showPopup && (
        <div className="popup">
          <div className="popup-inner">
            <span className="close-btn" onClick={() => setShowPopup(false)}>×</span>
            <h3>Your Score: {score} / {questions.length}</h3>
            <div className="popup-emoji">{popupEmoji}</div>
            <p className="popup-message">{popupMessage}</p>
          </div>
        </div>
      )}

      {showWarningPopup && (
        <div className="popup warning-popup">
          <div className="popup-inner">
            <span className="close-btn" onClick={() => setShowWarningPopup(false)}>×</span>
            <h3>Please complete all questions!</h3>
            <p>You must answer every question before submitting the quiz.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScienceUnitQuizPage;
