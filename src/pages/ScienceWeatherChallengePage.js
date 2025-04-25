import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase.js';
import { useNavigate } from 'react-router-dom';
import './ScienceWeatherChallengePage.css';

const allScenes = [
  { emoji: "❄️", description: "Snowing", correctTemp: -5, fact: "Snow usually forms below 0°C." },
  { emoji: "☀️", description: "Sunny", correctTemp: 30, fact: "Sunny days can often reach 30°C or more." },
  { emoji: "🌧️", description: "Rainy", correctTemp: 15, fact: "Rain is common between 10–20°C." },
  { emoji: "🌫️", description: "Foggy", correctTemp: 8, fact: "Fog typically forms in cool, moist conditions." },
  { emoji: "⛅", description: "Partly Cloudy", correctTemp: 20, fact: "Comfortable days with sun and clouds." },
  { emoji: "🌩️", description: "Thunderstorm", correctTemp: 18, fact: "Thunderstorms occur in warm, humid weather." },
  { emoji: "🌪️", description: "Windy", correctTemp: 10, fact: "Windy days feel cooler." },
  { emoji: "🌬️", description: "Cold Wind", correctTemp: 3, fact: "Wind makes it feel even colder." },
  { emoji: "🔥", description: "Extremely Hot", correctTemp: 45, fact: "Deserts can exceed 45°C during the day." },
  { emoji: "☁️", description: "Cloudy", correctTemp: 17, fact: "Cloud cover brings mild temperatures." },
  { emoji: "🌨️", description: "Blizzard", correctTemp: -10, fact: "Blizzards occur often below -10°C." },
  { emoji: "🌦️", description: "Drizzle", correctTemp: 12, fact: "Drizzles are gentle rains in cool weather." },
  { emoji: "💨", description: "Breezy", correctTemp: 11, fact: "Light winds in moderate weather." },
  { emoji: "🌞", description: "Hot Sun", correctTemp: 35, fact: "Hot days exceed 35°C in summer." },
  { emoji: "🧊", description: "Freezing", correctTemp: -15, fact: "Freezing is below 0°C." },
  { emoji: "🌻", description: "Spring Day", correctTemp: 22, fact: "Spring days are around 20–22°C." },
  { emoji: "🍂", description: "Autumn Wind", correctTemp: 14, fact: "Cooler temperatures in autumn." },
  { emoji: "⛈️", description: "Heavy Rain", correctTemp: 13, fact: "Heavy rain falls often in mild temperatures." },
  { emoji: "🌃", description: "Cool Night", correctTemp: 10, fact: "Cool nights after sunset." },
  { emoji: "🌇", description: "Warm Sunset", correctTemp: 25, fact: "Warm evenings after hot days." }
];

function ScienceWeatherChallengePage() {
  const [cards, setCards] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [currentCard, setCurrentCard] = useState(null);
  const [guess, setGuess] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [allCorrect, setAllCorrect] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [score, setScore] = useState(0);
  const [popupVisible, setPopupVisible] = useState(true);
  const [highScore, setHighScore] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const shuffled = [...allScenes].sort(() => 0.5 - Math.random()).slice(0, 20);
    setCards(shuffled);
  }, []);

  const handleCardSelect = (index) => {
    if (selectedCards.includes(index) || selectedCards.length >= 10 || currentCard !== null) return;
    setFeedbackText('');
    setCurrentCard(index);
  };

  const handleSubmitGuess = () => {
    const card = cards[currentCard];
    const isCorrect = Math.abs(guess - card.correctTemp) <= 10;
    const feedback = isCorrect
      ? `✅ Great job! ${card.fact}`
      : `❌ Not quite. ${card.fact} The correct answer was ${card.correctTemp}°C.`;

    setFeedbackText(feedback);
    setAnswers([...answers, isCorrect]);
    setSelectedCards([...selectedCards, currentCard]);
    setScore(prev => prev + (isCorrect ? 1 : 0));
    setCurrentCard(null);
    setGuess(0);
  };

  const handleShowResult = async () => {
    setShowResult(true);
    const correct = answers.every(ans => ans === true);
    setAllCorrect(correct);

    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const ref = doc(db, "users", user.uid, "scienceScores", "temperatureGame");
      const snapshot = await getDoc(ref);
      const previousHighScore = snapshot.exists() ? snapshot.data().score : 0;

      if (score > previousHighScore) {
        await setDoc(ref, { score: score }, { merge: true });
        setHighScore(score);
      } else {
        setHighScore(previousHighScore);
      }
    }
  };

  return (
    <div className="weather-challenge">
      <h2>🌡️ Weather Thermometer Challenge</h2>

      {popupVisible && (
        <div className="popup-modal">
          <div className="popup-content">
            <button className="popup-close" onClick={() => setPopupVisible(false)}>✖</button>
            <h3>Welcome!</h3>
            <p>Select 10 weather cards and estimate temperatures.</p>
            <p>If you get all correct, you'll unlock a surprise weather video! 🎥</p>
          </div>
        </div>
      )}

      <div className="popup-toggle-box" onClick={() => setPopupVisible(true)}>
        ℹ️ Info
      </div>

      {currentCard !== null && (
        <div className="guess-box">
          <p>{cards[currentCard].description}</p>
          <input
            type="range"
            min={-20}
            max={50}
            value={guess}
            onChange={(e) => setGuess(parseInt(e.target.value))}
          />
          <div>{guess}°C</div>
          <button onClick={handleSubmitGuess}>Submit Guess</button>
        </div>
      )}

      {!showResult && feedbackText && <p className="feedback-text">{feedbackText}</p>}

      {showResult ? (
        <>
          {highScore !== null && (
            <div className="score-box">
              <h4>🌟 Personal Best</h4>
              <p className="score-value">{highScore} / 10</p>
            </div>
          )}

          {allCorrect ? (
            <div className="video-reward">
            <h3>🎉 Amazing! You got all correct!</h3>
            <video width="300" height="200" controls>
              <source src="/videos/weather.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          
          ) : (
            <div className="result-box">
              <h3>You scored {score} out of 10</h3>
              <p>Try again to unlock the video! 🔄</p>
            </div>
          )}

          <button
            className="result-button"
            onClick={() => navigate('/module/science/exercises')}
          >
            🔙 Back to Science Exercises
          </button>
        </>
      ) : (
        <>
          <div className="card-grid">
            {cards.map((card, index) => (
              <div
                key={index}
                className={`card ${selectedCards.includes(index) ? 'flipped' : ''}`}
                onClick={() => handleCardSelect(index)}
              >
                <div className="card-inner">
                  <div className="card-front">❓</div>
                  <div className="card-back">{card.emoji}</div>
                </div>
              </div>
            ))}
          </div>

          {answers.length === 10 && (
            <button className="result-button" onClick={handleShowResult}>
              See Result
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default ScienceWeatherChallengePage;





