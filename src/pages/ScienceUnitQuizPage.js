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
  const [currentIndex, setCurrentIndex] = useState(0);

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

  const handleOptionClick = (option) => {
    if (!submitted) {
      setAnswers({ ...answers, [currentIndex]: option });
    }
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
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
    setCurrentIndex(0);
  };

  if (!questions.length) return <p>Loading questions...</p>;

  const currentQ = questions[currentIndex];
  const selected = answers[currentIndex];

  return (
    <div className="quiz-container">
      {submitted && (
        <div className="fixed-score">Score: {score} / {questions.length}</div>
      )}

      <h2>{unit.replace(/_/g, ' ').toUpperCase()}</h2>

      {!submitted && (
        <>
          <div className="question-block">
            <h4>{currentIndex + 1}. {currentQ.question}</h4>
            {currentQ.options.map((opt, j) => (
              <div
                key={j}
                className={`option ${selected === opt ? 'selected' : ''}`}
                onClick={() => handleOptionClick(opt)}
              >
                {opt}
              </div>
            ))}
          </div>

          <div className="navigation-buttons">
  <button
    className="nav-btn"
    onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
    disabled={currentIndex === 0}
  >
    ← Previous
  </button>

  {currentIndex < questions.length - 1 ? (
    <button
      className="nav-btn"
      onClick={() => setCurrentIndex((prev) => prev + 1)}
    >
      Next →
    </button>
  ) : (
    <button className="submit-btn" onClick={handleSubmit}>
      Submit Quiz
    </button>
  )}
</div>

        </>
      )}

      {submitted && (
        <>
          <div className="score-block">
            <div className="popup-emoji">{popupEmoji}</div>
            <p className="popup-message">{popupMessage}</p>
            <button className="submit-btn" onClick={restartQuiz}>Try Again</button>
          </div>
        </>
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
            <h3>Please answer all questions before submitting!</h3>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScienceUnitQuizPage;
