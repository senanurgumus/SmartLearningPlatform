// AudioExercisePage.js (Kişiye özel skor + soru karıştırmalı)
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase.js';
import './AudioExercisePage.css';

const originalQuestions = [
  {
    audioUrl: process.env.PUBLIC_URL + "/audios/cat.mp3",
    options: ["cat", "dog", "car"],
    answer: "cat"
  },
  {
    audioUrl: process.env.PUBLIC_URL + "/audios/train.mp3",
    options: ["bus", "train", "plane"],
    answer: "train"
  },
  {
    audioUrl: process.env.PUBLIC_URL + "/audios/drum.mp3",
    options: ["piano", "guitar", "drum"],
    answer: "drum"
  },
  {
    audioUrl: process.env.PUBLIC_URL + "/audios/piano.mp3",
    options: ["piano", "guitar", "drum"],
    answer: "piano"
  },
  {
    audioUrl: process.env.PUBLIC_URL + "/audios/bird.mp3",
    options: ["bird", "snake", "elephant"],
    answer: "bird"
  }
];

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const AudioExercisePage = () => {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);

  const audioRef = useRef(null);
  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    setQuestions(shuffleArray(originalQuestions));

    const fetchBest = async () => {
      if (user) {
        const ref = doc(db, 'audioRecognitionProgress', user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setBestScore(snap.data().bestScore || 0);
        }
      }
    };
    fetchBest();
  }, [user]);

  const playAudio = useCallback(() => {
    const audio = new Audio(questions[current].audioUrl);
    audio.play();
    audioRef.current = audio;
    setHasPlayed(true);
  }, [current, questions]);

  const handleAnswer = async (option) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    if (option === questions[current].answer) {
      setScore(prev => prev + 1);
    }

    if (current + 1 < questions.length) {
      setCurrent(current + 1);
      setHasPlayed(false);
    } else {
      const finalScore = option === questions[current].answer ? score + 1 : score;
      setShowResult(true);

      if (user && finalScore > bestScore) {
        const ref = doc(db, 'audioRecognitionProgress', user.uid);
        await setDoc(ref, {
          userId: user.uid,
          bestScore: finalScore
        });
        setBestScore(finalScore);
      }
    }
  };

  const restartGame = () => {
    setQuestions(shuffleArray(originalQuestions));
    setCurrent(0);
    setScore(0);
    setShowResult(false);
    setHasPlayed(false);
  };

  return (
    <div className="audio-page-container">
      <h2 className="audio-page-title">🎧 Listen & Choose!</h2>

      {!showResult ? (
        <>
          {!hasPlayed ? (
            <button className="audio-play-button" onClick={playAudio}>
              🔊 Play Sound
            </button>
          ) : (
            questions[current]?.options.map((opt, idx) => (
              <button
                key={idx}
                className="answer-button"
                onClick={() => handleAnswer(opt)}
              >
                {opt}
              </button>
            ))
          )}

          <div className="score-info">
            <p>✅ Current Score: <b>{score}</b></p>
            <p>🏆 Best Score: <b>{bestScore}</b></p>
          </div>
        </>
      ) : (
        <div className="result-box">
          <h3 className="result-title">🎉 Well done!</h3>
          <p>Your Score: <b>{score}</b></p>
          <p>Best Score: <b>{bestScore}</b></p>
          <button className="result-button" onClick={restartGame}>🔁 Play Again</button>
          <button className="result-button" onClick={() => navigate('/module/english/exercises')}>🔙 Back to English Exercises</button>
        </div>
      )}
    </div>
  );
};

export default AudioExercisePage;