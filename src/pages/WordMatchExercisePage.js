// WordMatchExercisePage.js
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase.js';
import './WordMatchExercisePage.css';

const levels = [
  { id: 1, name: "Level 1", words: ["Apple", "Dog", "Car"] },
  { id: 2, name: "Level 2", words: ["Banana", "Fish", "Sun"] },
  { id: 3, name: "Level 3", words: ["Tree", "Train", "Book"] },
  { id: 4, name: "Level 4", words: ["Ball", "Chair", "Clock"] },
  { id: 5, name: "Level 5", words: ["Star", "Cloud", "Phone"] }
];

const createPairsFromWords = (words) => {
  return words.map((word) => ({
    word,
    image: `/images/${word.toLowerCase()}.png`
  }));
};

const WordMatchExercisePage = () => {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [pairs, setPairs] = useState([]);
  const [draggedWord, setDraggedWord] = useState(null);
  const [score, setScore] = useState(0);
  const [matched, setMatched] = useState([]);
  const [unlockedLevel, setUnlockedLevel] = useState(1);
  const [showCongrats, setShowCongrats] = useState(false);
  const [user, setUser] = useState(null);
  const successAudioRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const ref = doc(db, "wordMatchProgress", currentUser.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setUnlockedLevel(data.unlockedLevel || 1);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLevelSelect = (level) => {
    setSelectedLevel(level);
    setPairs(createPairsFromWords(level.words));
    setScore(0);
    setMatched([]);
    setShowCongrats(false);
  };

  const handleDrop = async (word, targetImage) => {
    if (word === targetImage && !matched.includes(word)) {
      if (successAudioRef.current) {
        successAudioRef.current.pause();
        successAudioRef.current.currentTime = 0;
      }
      const sound = new Audio(process.env.PUBLIC_URL + "/audios/success.mp3");
      sound.play();
      successAudioRef.current = sound;

      const updatedMatched = [...matched, word];
      setMatched(updatedMatched);
      const newScore = score + 1;
      setScore(newScore);

      // ✅ Transparan arka planlı konfeti
      confetti.create(undefined, {
        resize: true,
        useWorker: true
      })({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.7 }
      });

      if (updatedMatched.length === pairs.length) {
        setShowCongrats(true);

        if (user) {
          const ref = doc(db, "wordMatchProgress", user.uid);
          const snap = await getDoc(ref);
          const prevData = snap.exists() ? snap.data() : {};
          const newBest = newScore > (prevData.bestScore || 0) ? newScore : (prevData.bestScore || 0);
          const newUnlocked = selectedLevel.id === (prevData.unlockedLevel || 1)
            ? selectedLevel.id + 1
            : (prevData.unlockedLevel || 1);

          setUnlockedLevel(newUnlocked);

          await setDoc(ref, {
            userId: user.uid,
            unlockedLevel: newUnlocked,
            bestScore: newBest
          });
        }
      }
    } else {
      setScore((prev) => Math.max(prev - 1, 0));
    }
    setDraggedWord(null);
  };

  const handleRestart = () => {
    if (selectedLevel) {
      setPairs(createPairsFromWords(selectedLevel.words));
      setMatched([]);
      setScore(0);
      setShowCongrats(false);
    }
  };

  const handleNextLevel = () => {
    const nextLevel = levels.find((lvl) => lvl.id === selectedLevel.id + 1);
    if (nextLevel) {
      handleLevelSelect(nextLevel);
    } else {
      alert("🎉 You completed all levels!");
    }
  };

  return (
    <div className="word-match-container">
      <h2 className="word-match-title">🧠 Word Match Game</h2>

      {!selectedLevel ? (
        <div className="level-selection">
          <h3 className="select-level">Select a Level:</h3>
          {user && levels.map((level) => (
            <button
              key={level.id}
              disabled={level.id > unlockedLevel}
              onClick={() => handleLevelSelect(level)}
              className={`level-button ${level.id > unlockedLevel ? 'locked' : ''}`}
            >
              {level.name} {level.id > unlockedLevel && "🔒"}
            </button>
          ))}
        </div>
      ) : (
        <>
          <div className="word-list">
            {pairs.map((pair, idx) => (
              <div
                key={idx}
                className={`word-draggable ${matched.includes(pair.word) ? 'matched' : ''}`}
                draggable={!matched.includes(pair.word)}
                onDragStart={() => setDraggedWord(pair.word)}
              >
                {pair.word}
              </div>
            ))}
          </div>

          <div className="image-drop-area">
            {pairs.map((pair, idx) => (
              <div
                key={idx}
                className="image-target"
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(draggedWord, pair.word)}
              >
                <img src={pair.image} alt={pair.word} />
              </div>
            ))}
          </div>

          {showCongrats && (
            <>
              <div className="congrats-message">
                🎉 Great job! You completed {selectedLevel.name}!
              </div>
              <button className="next-level-button" onClick={handleNextLevel}>
                👉 Click for the Next Level
              </button>
            </>
          )}

          <div className="button-group">
            <button className="result-button" onClick={handleRestart}>🔁 Play Again</button>
            <button className="result-button" onClick={() => navigate('/module/english/exercises')}>🔙 Back to Exercises</button>
          </div>
        </>
      )}
    </div>
  );
};

export default WordMatchExercisePage;
