// 🎯 Düzenlenmiş Dashboard.js (triggerReward fixli, ESLint hatasız + 🧃 Juice Bar Break eklendi)

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
import JuiceBar from '../components/JuiceBar.js';


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
  { option: '🧃 Juice Bar Break' },
  { option: '🐾 Pet Dance Mode' },
  { option: '📜 Fortune Scroll' },
  { option: '🎵 Sound Surprise' },
  { option: '🧢 Pet Hat Unlock' },
  { option: '🐕‍🦺 Rename Your Pet' },
  { option: '🔢 Math Trick' },
  { option: '🎵 Background Music Pack' }
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
  const [juiceBarVisible, setJuiceBarVisible] = useState(false);
  const [juiceMessage, setJuiceMessage] = useState('');
  const [fortune, setFortune] = useState('');
  const [showHat, setShowHat] = useState(false);
  const [petName, setPetName] = useState('Buddy');
  const [musicPlaying, setMusicPlaying] = useState(false);
  const musicRef = useRef(null);
  const [showMusicControl, setShowMusicControl] = useState(false);
  const [soundSurpriseSrc, setSoundSurpriseSrc] = useState(null);
  const [rewardResult, setRewardResult] = useState('');
  


  const triggerReward = (option) => {
        setRewardResult(`✨ You won: ${option}`); // 🎁 Ödül bildirimi kutusu

    switch (option) {
      case '🐾 Pet Dance Mode': {
        document.querySelector('.pet-widget')?.classList.add('dance');
        setTimeout(() => document.querySelector('.pet-widget')?.classList.remove('dance'), 5000);
        break;
      }
      case '🧃 Juice Bar Break': {
        const juices = ['🍓 Strawberry Splash!', '🍊 Orange Blast!', '🍍 Pineapple Power!'];
        const randomJuice = juices[Math.floor(Math.random() * juices.length)];
        setJuiceMessage(randomJuice);
        setJuiceBarVisible(true);
        setTimeout(() => setJuiceBarVisible(false), 5000);
        break;
      }
      case '📜 Fortune Scroll': {
        setFortune("You'll achieve great things today!");
        setTimeout(() => setFortune(''), 5000);
        break;
      }
      case '🎵 Sound Surprise': {
        const sounds = ['/sounds/clap.mp3', '/sounds/laugh.mp3'];
        const randomSound = sounds[Math.floor(Math.random() * sounds.length)];
        setSoundSurpriseSrc(randomSound);
        break;
      }
      case '🧢 Pet Hat Unlock': {
        setShowHat(true);
        break;
      }

      case '🐕‍🦺 Rename Your Pet': {
  const newName = prompt('Enter a new name for your pet:');
  if (newName) {
    setPetName(newName);
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(`petName_${user.uid}`, newName);
    localStorage.setItem(`petNameDate_${user.uid}`, today);
  }
  break;
}

      case '🔢 Math Trick': {
        alert('🧠 Math Trick: Multiply any number by 11 by adding its digits in between!');
        break;
      }
      case '🎵 Background Music Pack': {
        if (!musicRef.current) {
          musicRef.current = new Audio('/sounds/lofi.mp3');
          musicRef.current.loop = true;
        }
        setShowMusicControl(true);
        break;
      }
      default:
        console.warn('Unknown reward:', option);
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
      const seenDate = localStorage.getItem(`spinnerDate_${currentUser.uid}`);
      const storedReward = localStorage.getItem(`spinnerReward_${currentUser.uid}`);
        const savedPetName = localStorage.getItem(`petName_${currentUser.uid}`);
  const savedNameDate = localStorage.getItem(`petNameDate_${currentUser.uid}`);

    // Pet adını gün içindeyse yükle
  if (savedPetName && savedNameDate === today) {
    setPetName(savedPetName);
  } else {
    localStorage.removeItem(`petName_${currentUser.uid}`);
    localStorage.removeItem(`petNameDate_${currentUser.uid}`);
  }

      if (seenDate !== today) {
    setShowSpinner(true);
  } else if (storedReward) {
    // Girişte otomatik göstermiyoruz, sadece "Show Today’s Spin Gift" butonuna basınca gösterilecek
    }
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

  if (isRunning && timer > 0) {
    interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          playEndSound();
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  return () => clearInterval(interval);
}, [isRunning, timer]);



 const playEndSound = () => {
  const audio = new Audio('/sounds/ding.mp3');
  audio.play().catch((err) => {
    console.error("Sound failed:", err);
  });
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
  const today = new Date().toISOString().split('T')[0];
  const spinKey = `spinnerDate_${user.uid}`;

  if (localStorage.getItem(spinKey) === today) {
    alert("🎯 You already spun today! Come back tomorrow!");
    return;
  }

  const prize = Math.floor(Math.random() * rouletteData.length);
  setPrizeNumber(prize);
  setMustSpin(true);
};


  const dismissSpinner = () => {
    setShowSpinner(false);
    setSpinnerDismissed(true);
  };


  return (
  <div className="dashboard-container">
      <h2 className="welcome-text">
        👋 Welcome to Smart Learning, <strong>{userName}</strong>!
        <br />
        <span className="day-message">{dayMessage}</span>
      </h2>

      <Chatbot />

  

      <div className="pet-widget" onClick={handlePetClick}>
        <img src="/images/petdog.png" alt="Pet Companion" />
        {showHat && <img className="pet-hat" src="/images/hat.png" alt="Pet Hat" />}
        <p className="pet-name">{petName}</p>
      </div>
      {fortune && <div className="fortune-scroll">{fortune}</div>}

      {showPetMessage && <div className="pet-message">{petMessage}</div>}

     
{user && localStorage.getItem(`spinnerDate_${user.uid}`) === new Date().toISOString().split('T')[0] && (
  <div style={{ textAlign: 'center', margin: '1.5rem 0' }}>
    <button
      className="dashboard-show-gift-button"
      onClick={() => {
        const reward = localStorage.getItem(`spinnerReward_${user.uid}`);
        if (reward) {
          triggerReward(reward);
        }
      }}
    >
      🎁 Show Today’s Spin Gift
    </button>
  </div>
)}


      
        {showMusicControl && (
          <div className="music-control-bar">
            🎵 You unlocked Lofi music!
            <button onClick={() => {
              if (musicRef.current) {
                if (musicPlaying) {
                  musicRef.current.pause();
                  setMusicPlaying(false);
                } else {
                  musicRef.current.play().catch(err => {
                    console.warn("Autoplay failed. User interaction required.");
                  });
                  setMusicPlaying(true);
                }
              }
            }}>
      {musicPlaying ? '⏸ Pause' : '▶️ Play'}
    </button>
    <button onClick={() => {
      if (musicRef.current) {
        musicRef.current.pause();
        musicRef.current.currentTime = 0;
        setMusicPlaying(false);
        setShowMusicControl(false);
      }
    }}>
      ❌ Stop Music
    </button>
  </div>
)}


{soundSurpriseSrc && (
  <div className="sound-surprise-box">
    🎉 You won a Sound Surprise!
    <button onClick={() => {
      const audio = new Audio(soundSurpriseSrc);
      audio.play().catch(() => {
        alert("⚠️ Your browser blocked the sound. Click again to retry.");
      });
      setSoundSurpriseSrc(null); // tekrar tetiklenmesin
    }}>
      ▶️ Play Sound
    </button>
  </div>
)}

      {showSpinner && (
  <div className="dashboard-spinner">
    <div className="spin-box">
      {/* Çarpı butonu en üste gelsin */}
         <button className="close-btn" onClick={dismissSpinner}>✖</button>


      <h3 className="spinner-title">
        🎁 <span className="glow-text">Daily Bonus Spinner</span>
      </h3>

      {rewardResult && <div className="reward-result-box">{rewardResult}</div>}

      <Wheel
        mustStartSpinning={mustSpin}
        prizeNumber={prizeNumber}
        data={rouletteData}
        backgroundColors={["#ffd6ec", "#d6fce5", "#d6eaff", "#fff9d6"]}
        textColors={["#000"]}
        outerBorderColor="transparent"
        innerBorderColor="transparent"
        radiusLineColor="#00000015"
        fontSize={13}
        textDistance={55}
        onStopSpinning={() => {
          const reward = rouletteData[prizeNumber].option;
          triggerReward(reward);
          setMustSpin(false); // ❗ çark durunca butonu göster

          const today = new Date().toISOString().split('T')[0];
          localStorage.setItem(`spinnerDate_${user.uid}`, today);
          localStorage.setItem(`spinnerReward_${user.uid}`, reward);
        }}
      />

      <button className="spin-button" onClick={handleSpin}>Spin</button>
    </div>
  </div>
)}



      <div className="tip-of-day">{dailyTip}</div>
      

      {juiceBarVisible && <JuiceBar message={juiceMessage} />}

<div className="left-panel">
<div className="pomodoro-widget">
  <p>Focus Timer</p>

  {/* Süre Ayarı */}
  {!isRunning && (
    <div style={{ marginBottom: '0.5rem' }}>
      <label style={{ fontSize: '0.9rem' }}>Minutes:</label>
      <input
        type="number"
        min="1"
        max="120"
        value={Math.floor(timer / 60)}
        onChange={(e) => setTimer(Number(e.target.value) * 60)}
        style={{ width: '60px', marginLeft: '0.5rem' }}
      />
    </div>
  )}

  {/* Kalan Süre */}
  <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
    {String(Math.floor(timer / 60)).padStart(2, '0')}:
    {String(timer % 60).padStart(2, '0')}
  </p>

  {/* Kontrol Butonları */}
  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
    <button onClick={toggleTimer}>
      {isRunning ? 'Pause' : 'Start'}
    </button>

    {/* Reset sadece duraklamışken gösterilsin */}
    {!isRunning && timer !== 1500 && (
      <button
        onClick={() => setTimer(1500)}
      >
        Reset
      </button>
    )}
  </div>
</div>



      <div className="fun-fact-box">
        <p className="fun-fact-title">🧠 Did You Know?</p>
        <p className="fun-fact-text">{randomFact}</p>
      </div>

      <div className="mission-box">
        <h3 className="mission-title">🎯 Today’s Missions</h3>
        <div className="mission-input">
          <input
            type="text"
            value={newMission}
            onChange={(e) => setNewMission(e.target.value)}
            placeholder="Add a new mission..."
          />
          <button onClick={handleAddMission}> Add</button>
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
      
</div>

      {showContent && (
  <>
    <div className="module-section-with-bg" style={{ position: 'relative', padding: '8rem 8rem', overflow: 'hidden' }}>
      <div
        style={{
          backgroundImage: `url(${process.env.PUBLIC_URL}/images/dashboardnew.png)`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: 'cover', // <-- önemli: görsel tüm alanı kaplar
          opacity: 0.40, // daha yumuşak bir görünüm için düşürüldü
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          pointerEvents: 'none'
        }}
      />
      <div style={{ position: 'relative', zIndex: 1 }}>
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
      </div>
    </div>

    <DashboardHighlights />
  </>
)}

    </div>
  );
}

export default Dashboard;
