import React, { useEffect, useState } from 'react';
import './QuizPage.css';
import { db, app } from '../firebase.js';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useParams } from 'react-router-dom'; // 🟢 URL'den moduleId al

function QuizPage() {
  const { moduleId } = useParams(); // 🟢 /module/:moduleId/quiz
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [emoji, setEmoji] = useState('');
  const [message, setMessage] = useState('');
  const [showWarningPopup, setShowWarningPopup] = useState(false);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  const emojis = ['🌟', '🎉', '👏', '🍭', '😊', '🧁', '🐥', '🍩'];
  const messages = [
    'Great job, superstar!',
    'Keep up the amazing work!',
    'You’re on the right path!',
    'Practice makes perfect!',
    'You did awesome!',
    'You’re getting better every day!',
    'Believe in yourself!',
    'Well done, learner!'
  ];

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const data = await import(`../data/${moduleId}_quiz.json`);
        const quizList = data.default;
        const shuffled = quizList.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 10);
        setQuestions(selected);
      } catch (error) {
        console.error('Quiz data could not be loaded:', error);
      }

      const auth = getAuth(app);
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setUserId(user.uid);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    };

    loadQuiz();
  }, [moduleId]);

  const handleOptionClick = (qIndex, option) => {
    if (!submitted) {
      setAnswers({ ...answers, [qIndex]: option });
    }
  };

  const handleSubmit = async () => {
    if (loading || !userId) {
      alert('User not logged in.');
      return;
    }

    const unanswered = questions.findIndex((_, i) => answers[i] === undefined);
    if (unanswered !== -1) {
      setShowWarningPopup(true);
      return;
    }

    let count = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.answer) count++;
    });

    setScore(count);
    setSubmitted(true);
    setEmoji(emojis[Math.floor(Math.random() * emojis.length)]);
    setMessage(messages[Math.floor(Math.random() * messages.length)]);
    setShowPopup(true);

    try {
      await addDoc(collection(db, 'quizResults'), {
        userId,
        score: count,
        total: questions.length,
        module: moduleId, // ✅ dinamik modül adı
        timestamp: Timestamp.now()
      });
    } catch (error) {
      console.error('Error saving result to Firestore:', error);
    }
  };

  const restartQuiz = () => {
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 10);
    setQuestions(selected);
    setAnswers({});
    setSubmitted(false);
    setScore(0);
    setShowPopup(false);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="quiz-container">
      {submitted && (
        <div className="fixed-score">Score: {score} / {questions.length}</div>
      )}

      <h2>{moduleId.toUpperCase()} Quiz</h2>

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

      {/* 🎉 Quiz sonucu pop-up */}
      {showPopup && (
        <div className="popup">
          <div className="popup-inner">
            <span className="close-btn" onClick={() => setShowPopup(false)}>×</span>
            <h3>Your Score: {score} / {questions.length}</h3>
            <div className="popup-emoji">{emoji}</div>
            <p className="popup-message">{message}</p>
          </div>
        </div>
      )}

      {/* ❗️ Eksik soru uyarısı */}
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

export default QuizPage;
