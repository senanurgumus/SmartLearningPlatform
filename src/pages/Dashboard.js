import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase.js';
import { Link } from 'react-router-dom';
import './Dashboard.css';
import DashboardHighlights from './DashboardHighlights.js';
import Chatbot from '../components/Chatbot.js';  // Chatbot bileşenini import ediyoruz




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

  useEffect(() => {
    const hour = new Date().getHours();
    setIsNight(hour < 6 || hour >= 18);
    const day = new Date().getDay();
    setDayMessage(dayMessages[day]);

    const randomIndex = Math.floor(Math.random() * funFacts.length);
    setRandomFact(funFacts[randomIndex]);

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

  return (
    <div className={`dashboard-container ${isNight ? 'night-mode' : 'day-mode'}`}>
      <h2 className="welcome-text">
        👋 Welcome to Smart Learning, <strong>{userName}</strong>!
        <br />
        <span className="day-message">{dayMessage}</span>
      </h2>
      <Chatbot />

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
          </div>



          <DashboardHighlights />
         



          
        </>
      )}
    </div>
  );
}

export default Dashboard;
