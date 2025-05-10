// Dashboard.js (entegre edilmiş tüm ödüllerle)
import React, { useEffect, useState, useRef } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase.js';
import { Link } from 'react-router-dom';
import './Dashboard.css';
import DashboardHighlights from './DashboardHighlights.js';
import Chatbot from '../components/Chatbot.js';
import { Wheel } from 'react-custom-roulette';
import Confetti from 'react-confetti';

const dayMessages = [
  "Rest and recharge. Happy Sunday! ☕",
  "Have a powerful Monday! 💪",
  "Keep going strong this Tuesday! 🚀",
  "Halfway there, happy Wednesday! 🐪",
  "Thriving Thursday, let's go! 🎯",
  "Finally Friday! 🎉",
  "Weekend vibes! Happy Saturday! 😎"
];

const funFacts = [
  "Honey never spoils. Archaeologists found edible honey in ancient tombs!",
  "Octopuses have three hearts and blue blood!",
  "Bananas are berries, but strawberries aren’t!",
  "Lightning strikes the Earth about 8 million times a day!",
  "The Eiffel Tower can grow taller in summer!",
  "Some frogs can freeze without dying!",
  "Your brain uses 20% of your body’s energy!",
];

const motivationalMessages = [
  "You're doing amazing! 🌟",
  "Keep it up! 💪",
  "You got this! 🚀",
  "One step at a time! 🐾",
  "Smart is the new cool 😎",
];

const tips = [
  "💡 You can click the dog for a surprise!",
  "💡 Don’t forget to check your daily missions!",
  "💡 Use the Focus Timer to stay productive!",
  "💡 Explore modules to learn smarter!",
  "💡 Have fun and learn smart! 🚀"
];

const rouletteData = [
  { option: '🎊 Confetti Rain' },
  { option: '🐾 Pet Dance Mode' },
  { option: '📜 Fortune Scroll' },
  { option: '🎵 Sound Surprise' },
  { option: '🧢 Pet Hat Unlock' },
  { option: '🐕‍🦺 Rename Your Pet' },
  { option: '🔢 Math Trick' },
  { option: '🎵 Background Music Pack' }
];

const mathTricks = [
  "Multiply by 9 using your fingers!",
  "11 trick: 45x11 = 4 (4+5) 5 → 495",
  "Square ending in 5: 25² = 625 (2x3=6 then add 25)"
];

function Dashboard() {
  const [modules, setModules] = useState([]);
  const [showContent, setShowContent] = useState(false);
  const [user, setUser] = useState(null);
  const [isNight, setIsNight] = useState(false);
  const [userName, setUserName] = useState("");
  const [dayMessage, setDayMessage] = useState("");
  const [randomFact, setRandomFact] = useState("");
  const [missions, setMissions] = useState([]);
  const [newMission, setNewMission] = useState("");
  const [timer, setTimer] = useState(1500);
  const [isRunning, setIsRunning] = useState(false);
  const [showPetMessage, setShowPetMessage] = useState(false);
  const [petMessage, setPetMessage] = useState("");
  const [showSpinner, setShowSpinner] = useState(false);
  const [spinnerDismissed, setSpinnerDismissed] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [mustSpin, setMustSpin] = useState(false);
  const [dailyTip, setDailyTip] = useState("");

  const [confetti, setConfetti] = useState(false);
  const [fortune, setFortune] = useState('');
  const [showHat, setShowHat] = useState(false);
  const [petName, setPetName] = useState('Buddy');
  const [musicPlaying, setMusicPlaying] = useState(false);
  const musicRef = useRef(null);

  const triggerReward = (option) => {
    switch (option) {
            case '🐾 Pet Dance Mode':
        document.querySelector('.pet-widget')?.classList.add('dance');
        setTimeout(() => document.querySelector('.pet-widget')?.classList.remove('dance'), 5000);
        break;
      case '🎊 Confetti Rain':
        setConfetti(true);
        setTimeout(() => setConfetti(false), 10000);
        break;
      case '📜 Fortune Scroll':
        setFortune('You\'ll achieve great things today!');
        setTimeout(() => setFortune(''), 5000);
        break;
      case '🎵 Sound Surprise': {
        const sounds = ['/sounds/clap.mp3', '/sounds/laugh.mp3'];
        const random = new Audio(sounds[Math.floor(Math.random() * sounds.length)]);
        random.play();
        break;
      }
      case '🧢 Pet Hat Unlock':
        setShowHat(true);
        break;
      case '🐕‍🦺 Rename Your Pet': {
        const newName = prompt('Enter a new name for your pet:');
        if (newName) setPetName(newName);
        break;
      }
      case '🔢 Math Trick':
        alert('🧠 Math Trick: Multiply any number by 11 by adding its digits in between!');
        break;
      case '🎵 Background Music Pack':
        if (!musicRef.current) {
          musicRef.current = new Audio('/sounds/lofi.mp3');
          musicRef.current.loop = true;
        }
        if (musicPlaying) {
          musicRef.current.pause();
          setMusicPlaying(false);
        } else {
          musicRef.current.play();
          setMusicPlaying(true);
        }
        break;
    }
  };

  useEffect(() => {
    const hour = new Date().getHours();
    setIsNight(hour < 6 || hour >= 18);
    const day = new Date().getDay();
    setDayMessage(dayMessages[day]);
    const randomIndex = Math.floor(Math.random() * funFacts.length);
    setRandomFact(funFacts[randomIndex]);
    const tipIndex = new Date().getDate() % tips.length;
    setDailyTip(tips[tipIndex]);

    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const name = currentUser.email.split('@')[0];
        setUserName(name.charAt(0).toUpperCase() + name.slice(1));
        const localMissions = localStorage.getItem(`missions_${currentUser.uid}`);
        if (localMissions) {
          setMissions(JSON.parse(localMissions));
        }
        const today = new Date().toISOString().split('T')[0];
        const seenSpinner = localStorage.getItem(`spinnerShown_${currentUser.uid}`);
        if (seenSpinner !== today) {
          setShowSpinner(true);
          localStorage.setItem(`spinnerShown_${currentUser.uid}`, today);
        }
      } else {
        setUser(null);
      }
    });

    const fetchModules = async () => {
      const snapshot = await getDocs(collection(db, 'modules'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setModules(data);
    };
    fetchModules();
    const timer = setTimeout(() => setShowContent(true), 800);
    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            playEndSound();
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const playEndSound = () => {
    const audio = new Audio('/sounds/ding.mp3');
    audio.play();
  };

  const toggleTimer = () => setIsRunning(!isRunning);

  const handlePetClick = () => {
    const msg = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
    setPetMessage(msg);
    setShowPetMessage(true);
    setTimeout(() => setShowPetMessage(false), 3000);
  };

  const updateMissions = (updated) => {
    setMissions(updated);
    if (user) {
      localStorage.setItem(`missions_${user.uid}`, JSON.stringify(updated));
    }
  };

  const toggleMission = (index) => {
    const updated = [...missions];
    updated[index].done = !updated[index].done;
    updateMissions(updated);
  };

  const handleAddMission = () => {
    if (newMission.trim() === "") return;
    const updated = [...missions, { task: newMission.trim(), done: false }];
    setNewMission("");
    updateMissions(updated);
  };

  const handleDeleteMission = (index) => {
    const updated = missions.filter((_, i) => i !== index);
    updateMissions(updated);
  };

  const handleSpin = () => {
    const prize = Math.floor(Math.random() * rouletteData.length);
    setPrizeNumber(prize);
    setMustSpin(true);
  };

  const dismissSpinner = () => {
    setShowSpinner(false);
    setSpinnerDismissed(true);
  };

  return (
    <div className={`dashboard-container ${isNight ? 'night-mode' : 'day-mode'}`}>
      {confetti && <Confetti numberOfPieces={300} recycle={false} />}

      <h2 className="welcome-text">
        👋 Welcome to Smart Learning, <strong>{userName}</strong>!
        <br />
        <span className="day-message">{dayMessage}</span>
      </h2>

      <Chatbot />

      <div className="background-animation-container">
        <video
          className="background-float-video"
          src="/videos/dashboard1.mp4"
          autoPlay
          muted
          loop
          playsInline
        />
      </div>

      <div className="pet-widget" onClick={handlePetClick}>
        <img src="/images/petdog.png" alt="Pet Companion" />
        {showHat && <img className="pet-hat" src="/images/hat.png" alt="Pet Hat" />}
        <p className="pet-name">{petName}</p>
      </div>
      {fortune && <div className="fortune-scroll">{fortune}</div>}

      {showPetMessage && <div className="pet-message">{petMessage}</div>}

      <div className="pomodoro-widget">
        <p>Focus Timer</p>
        <p>{Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}</p>
        <button onClick={toggleTimer}>{isRunning ? 'Pause' : 'Start'}</button>
      </div>

      {showSpinner && (
        <div className="spinner-modal">
          <div className="spinner-box">
            <button className="spinner-close" onClick={dismissSpinner}>✖</button>
            <h3>🎁 Daily Bonus Spinner</h3>
            <Wheel
              mustStartSpinning={mustSpin}
              prizeNumber={prizeNumber}
              data={rouletteData}
              backgroundColors={["#FFE066", "#6BCB77"]}
              textColors={["#000"]}
              onStopSpinning={() => {
                const reward = rouletteData[prizeNumber].option;
                triggerReward(reward);
                setMustSpin(false);
              }}
            />
            <button className="spin-button" onClick={handleSpin}>Spin</button>
          </div>
        </div>
      )}

      <div className="tip-of-day">{dailyTip}</div>

      <div className="mission-box">
        <h3 className="mission-title">🎯 Today’s Missions</h3>
        <div className="mission-input">
          <input
            type="text"
            value={newMission}
            onChange={(e) => setNewMission(e.target.value)}
            placeholder="Add a new mission..."
          />
          <button onClick={handleAddMission}>➕ Add</button>
        </div>

        {missions.map((m, i) => (
          <div key={i} className={`mission-item ${m.done ? 'completed' : ''}`}>
            <div
              className={`mission-checkbox ${m.done ? 'checked' : ''}`}
              onClick={() => toggleMission(i)}
            />
            <span style={{ flex: 1, textAlign: 'left' }}>{m.task}</span>
            <button className="mission-delete" onClick={() => handleDeleteMission(i)}>🗑</button>
          </div>
        ))}
      </div>

      <div className="fun-fact-box">
        <p className="fun-fact-title">🧠 Did You Know?</p>
        <p className="fun-fact-text">{randomFact}</p>
      </div>

      {showContent && (
        <>
          <div className="module-grid">
            {modules.map((mod) => (
              <Link to={`/module/${mod.id}`} key={mod.id} style={{ textDecoration: 'none' }}>
                <div className="module-card-dashboard" style={{ backgroundColor: mod.color }}>
                  {mod.name}
                </div>
              </Link>
            ))}
          </div>

          <div className="achievements-button-container">
            <Link to="/achievements" className="achievements-button">
              🏅 My Achievements
            </Link>
          </div>

          <div className="drawing-buttons-container">
            <Link to="/draw" className="drawing-button">✏️ Let's Draw</Link>
            <Link to="/paint" className="drawing-button">🖌️ Let's Paint</Link>
            <Link to="/pop" className="drawing-button">🎈 Let's Pop</Link>
            <Link to="/puzzles" className="drawing-button">🧩 Let's Puzzle</Link>
          </div>

          <DashboardHighlights />
        </>
      )}
    </div>
  );
}

export default Dashboard;
