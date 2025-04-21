// BarGraphExercisePage.js 📊 Hikayeli + Skor + Yardım Butonu
import React, { useState, useEffect, useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js';
import './BarGraphExercisePage.css';
import { barGraphQuestions } from '../data/barGraphQuestionBank.js';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase.js';
import { useNavigate } from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const getRandomQuestion = () => barGraphQuestions[Math.floor(Math.random() * barGraphQuestions.length)];

const BarGraphExercisePage = () => {
  const [currentQ, setCurrentQ] = useState(getRandomQuestion());
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState("");
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [user, setUser] = useState(null);
  const [showStoryPopup, setShowStoryPopup] = useState(false);
  const [currentStory, setCurrentStory] = useState("");
  const [showInfo, setShowInfo] = useState(true);
  const audioRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const ref = doc(db, 'barGraphProgress', currentUser.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setBestScore(snap.data().bestScore || 0);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleAnswer = async (opt) => {
    setSelected(opt);
    if (opt === currentQ.answer) {
      const newScore = score + 1;
      setResult("✅ Correct!");
      setScore(newScore);

      if (newScore > bestScore && user) {
        setBestScore(newScore);
        await setDoc(doc(db, 'barGraphProgress', user.uid), {
          userId: user.uid,
          bestScore: newScore
        });
      }

      if (newScore % 10 === 0) {
        const storyId = Math.min(newScore / 10, 5);
        setCurrentStory(`/stories/story${storyId}.mp3`);
        setShowStoryPopup(true);
        return;
      }
    } else {
      setResult(`❌ Wrong! Correct answer was ${currentQ.answer}`);
      setScore(0);
    }
  };

  const restart = () => {
    setSelected(null);
    setResult("");
    setCurrentQ(getRandomQuestion());
  };

  const stopStory = () => {
    if (audioRef.current) {
      audioRef.current.pause(); // Sadece durdur
    }
  };

  const closeStoryPopup = () => {
    setShowStoryPopup(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    restart();
  };

  const playAudio = () => {
    if (currentStory) {
      if (!audioRef.current) {
        const audio = new Audio(currentStory);
        audioRef.current = audio;
      }
      audioRef.current.play();
    }
  };

  const toggleInfo = () => {
    setShowInfo(!showInfo);
  };

  const chartData = {
    labels: currentQ.labels,
    datasets: [
      {
        label: currentQ.title,
        data: currentQ.data,
        backgroundColor: ["#f87171", "#facc15", "#60a5fa", "#34d399"]
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 } }
    }
  };

  return (
    <div className="graph-exercise-container">
      <h2 className="graph-title">📊 Bar Graph Reading</h2>

      <button className="help-button" onClick={toggleInfo}>❓</button>

      {showInfo && (
        <div className="popup-overlay">
          <div className="popup-content">
            <button className="close-button" onClick={toggleInfo}>✖</button>
            <h3>🧠 How to Play</h3>
            <p>
              Look at the bar graph and read the question carefully.
              Choose the correct answer based on what you see!
            </p>
            <p>Earn points and unlock fun audio stories every 10 points!</p>
          </div>
        </div>
      )}

      <div className="chart-area">
        <Bar data={chartData} options={chartOptions} />
      </div>

      <div className="question-area">
        <p className="question-text">{currentQ.question}</p>
        <div className="options-list">
          {currentQ.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(opt)}
              className={`option-btn ${selected === opt ? 'selected' : ''}`}
              disabled={!!selected}
            >
              {opt}
            </button>
          ))}
        </div>
        {result && <p className="result-text">{result}</p>}
        {selected && <button className="restart-btn" onClick={restart}>🔁 Try Another</button>}
        <p className="score-text">Score: {score}</p>
        <p className="score-text">🏆 Best Score: {bestScore}</p>
      </div>

      <div className="back-button-fixed">
        <button onClick={() => navigate('/module/math/exercises')} className="result-button">
          🔙 Back to Math Exercises
        </button>
      </div>

      {showStoryPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <button className="close-button" onClick={closeStoryPopup}>✖</button>
            <h3>🎧 You unlocked a story!</h3>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
              <button onClick={playAudio} className="result-button">▶️ Play Story</button>
              <button onClick={stopStory} className="result-button">⏹ Stop Story</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BarGraphExercisePage;
