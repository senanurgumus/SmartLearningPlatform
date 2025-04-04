import React, { useEffect, useState } from 'react';
import quizData from '../english_quiz.json';
import './QuizPage.css';
import { db } from '../firebase.js';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

function QuizPage() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [emoji, setEmoji] = useState('');
  const [message, setMessage] = useState('');
  const [showWarningPopup, setShowWarningPopup] = useState(false); // ❗️ Yeni pop-up durumu

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
    const shuffled = quizData.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 10);
    setQuestions(selected);
    setAnswers({});
    setSubmitted(false);
    setScore(0);
  }, []);

  const handleOptionClick = (qIndex, option) => {
    if (!submitted) {
      setAnswers({ ...answers, [qIndex]: option });
    }
  };

  const handleSubmit = async () => {
    const unanswered = questions.findIndex((_, i) => answers[i] === undefined);
    if (unanswered !== -1) {
      setShowWarningPopup(true); // ❗️ Özel pop-up göster
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
      await addDoc(collection(db, "quizResults"), {
        userId: "testUser",
        score: count,
        total: questions.length,
        module: "english",
        timestamp: Timestamp.now()
      });
      console.log("Quiz sonucu Firestore'a kaydedildi.");
    } catch (error) {
      console.error("Firestore'a yazarken hata oluştu:", error);
    }
  };

  const restartQuiz = () => {
    const shuffled = quizData.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 10);
    setQuestions(selected);
    setAnswers({});
    setSubmitted(false);
    setScore(0);
    setShowPopup(false);
  };

  return (
    <div className="quiz-container">
      {submitted && (
        <div className="fixed-score">Score: {score} / {questions.length}</div>
      )}

      <h2>Quiz Time!</h2>

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

      {/* ❗️ Eksik soru uyarısı için özel pop-up */}
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
