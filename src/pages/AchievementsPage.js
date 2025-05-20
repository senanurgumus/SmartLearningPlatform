// src/pages/AchievementsPage.js
import React, { useEffect, useState } from 'react';
import { db, app } from '../firebase.js';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { startOfWeek, endOfWeek, format } from 'date-fns';
import './AchievementsPage.css';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const badgeDescriptions = {
  "🐣 Beginner": "Complete at least 1 quiz.",
  "🧠 Quiz Master": "Complete 10 quizzes.",
  "💯 Perfect Score": "Answer all questions correctly in a quiz.",
  "📚 Consistent Learner": "Solve quizzes for 3 consecutive days.",
  "🔥 Streak Champion": "Complete quizzes for 5 consecutive days."
};

const levelDescriptions = {
  "🏆 Master of Modules": "Achieve 800 correct answers to become a Master of Modules!🏆",
  "🧠 Knowledge Wizard": "Achieve 600 correct answers to become a Knowledge Wizard!🧠",
  "⚡ Quiz Pro": "Achieve 400 correct answers to become a Quiz Pro!⚡",
  "🚀 Learning Hero": "Achieve 200 correct answers to become a Learning Hero!🚀",
  "🌱 New Explorer": "Start your learning journey by answering at least 1 quiz correctly!🌱"
};

// Function to get earned badges
function getEarnedBadges(results) {
  const badges = [];
  const total = results.length;
  const perfect = results.filter(r => r.score === r.total).length;

  if (total >= 1) badges.push("🐣 Beginner");
  if (total >= 10) badges.push("🧠 Quiz Master");
  if (perfect >= 1) badges.push("💯 Perfect Score");

  const days = [...new Set(results.map(r => r.timestamp.toDate().toDateString()))].sort();
  let streak = 1;
  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1]);
    const curr = new Date(days[i]);
    if ((curr - prev) / (1000 * 60 * 60 * 24) === 1) {
      streak++;
      if (streak >= 3 && !badges.includes("📚 Consistent Learner")) {
        badges.push("📚 Consistent Learner");
      }
    } else {
      streak = 1;
    }
  }

  if (streak >= 5) badges.push("🔥 Streak Champion");
  return badges;
}

// Function to calculate the user's level based on their correct answers
function getLevel(correctTotal) {
  if (correctTotal >= 800) return "🏆 Master of Modules";
  if (correctTotal >= 600) return "🧠 Knowledge Wizard";
  if (correctTotal >= 400) return "⚡ Quiz Pro";
  if (correctTotal >= 200) return "🚀 Learning Hero";
  return "🌱 New Explorer";
}

function AchievementsPage() {
  const [userId, setUserId] = useState(null);
  const [moduleFilter, setModuleFilter] = useState("english");
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [unearnedBadges, setUnearnedBadges] = useState([]);
  const [weekMap, setWeekMap] = useState({});
  const [selectedWeek, setSelectedWeek] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupGif, setPopupGif] = useState("");
  const [levelProgress, setLevelProgress] = useState(0); // Track the progress for the level bar
  const [showLevelPopup, setShowLevelPopup] = useState(false); // To show level info popup
  const [levelDescription, setLevelDescription] = useState(""); // To store level description
  const [level, setLevel] = useState("🌱 New Explorer"); // User's current level state

  const handleBadgeClick = (badge) => {
    if (earnedBadges.includes(badge)) {
      setPopupMessage(`Congratulations! You've earned the ${badge} badge!`);
      setPopupGif('🎉');
    } else {
      setPopupMessage(`Keep going! You need to complete more quizzes to earn the ${badge} badge.`);
      setPopupGif('😞');
    }
    setShowPopup(true);
  };

  const handleLevelClick = (levelName) => {
    setLevelDescription(levelDescriptions[levelName]); // Set the description based on the clicked level
    setShowLevelPopup(true); // Show the level info popup
  };

  useEffect(() => {
    const auth = getAuth(app);
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) setUserId(user.uid);
    });
    return () => unsubAuth();
  }, []);


  useEffect(() => {
  const container = document.getElementById("floating-icons-container");
  if (!container) return;

  const icons = [
    "🏅", "🎓", "🔥", "💯", "🚀", "⭐", "✨", "📈", "🥇", "🌟",
    "📚", "🎯", "🏆", "🧠", "🔓", "✅", "🥳"
  ];
  const totalIcons = 25;

  for (let i = 0; i < totalIcons; i++) {
    const span = document.createElement("span");
    span.classList.add("floating-icon");
    span.innerText = icons[Math.floor(Math.random() * icons.length)];

    span.style.left = `${Math.random() * 100}vw`;
    span.style.animationDuration = `${12 + Math.random() * 6}s`; // 12–18s
    span.style.fontSize = `${18 + Math.random() * 22}px`;
    span.style.animationDelay = `${Math.random() * 5}s`;

    container.appendChild(span);
  }

  return () => {
    container.innerHTML = "";
  };
}, []);





  useEffect(() => {
    if (!userId) return;

    const q = query(collection(db, 'quizResults'),
      where('userId', '==', userId),
      where('module', '==', moduleFilter)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const all = snapshot.docs.map(doc => doc.data());
      const history = {};

      all.forEach(entry => {
        const date = entry.timestamp.toDate();
        const start = startOfWeek(date, { weekStartsOn: 1 });
        const end = endOfWeek(date, { weekStartsOn: 1 });
        const label = `${format(start, 'dd MMM')} - ${format(end, 'dd MMM yyyy')}`;
        if (!history[label]) history[label] = [];
        history[label].push(entry);
      });

      const totalCorrect = all.reduce((sum, entry) => sum + entry.score, 0);
      setLevel(getLevel(totalCorrect));
      setLevelProgress((totalCorrect % 200) / 200); // Calculate the level progress as a percentage

      const badges = getEarnedBadges(all);
      setEarnedBadges(badges);
      setUnearnedBadges(Object.keys(badgeDescriptions).filter(b => !badges.includes(b)));
      setWeekMap(history);

      const latestWeek = Object.keys(history).sort().pop();
      setSelectedWeek(latestWeek);
    });

    return () => unsub();
  }, [userId, moduleFilter]);

  const renderChart = (entries) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const grouped = {};
    days.forEach(day => grouped[day] = { correct: 0, incorrect: 0 });

    entries.forEach(e => {
      const d = e.timestamp.toDate();
      const weekday = d.toLocaleDateString('en-US', { weekday: 'long' });
      if (grouped[weekday]) {
        grouped[weekday].correct += e.score;
        grouped[weekday].incorrect += (e.total - e.score);
      }
    });

    return {
      labels: days,
      datasets: [
        {
          label: 'Correct',
          data: days.map(d => grouped[d].correct),
          backgroundColor: '#4CAF50'
        },
        {
          label: 'Incorrect',
          data: days.map(d => grouped[d].incorrect),
          backgroundColor: '#F44336'
        }
      ]
    };
  };

  return (
        <div className="achievements-page">

    <div className="achievements-container">
      <div id="floating-icons-container"></div>

<h2 className="pop-heading">🎓 Your Achievements</h2>

      <div className="module-filter">
        <label>Select Module:</label>
        <select value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)}>
          <option value="english">English</option>
          <option value="math">Math</option>
          <option value="science">Science</option>
        </select>
      </div>


      <div className="level-progress">
        <h3>Your Level</h3>
        <div className="level-bar">
          <div className="level-progress-bar" style={{ width: `${levelProgress * 100}%`, backgroundColor: '#9c5f5f' }} />
        </div>
        <div className="level-names">
          {["🌱 New Explorer", "🚀 Learning Hero", "⚡ Quiz Pro", "🧠 Knowledge Wizard", "🏆 Master of Modules"].map(levelName => (
            <div key={levelName} className="level-name" onClick={() => handleLevelClick(levelName)}>
              {levelName}
            </div>
          ))}
        </div>
      </div>
     

      {selectedWeek && (
        <div className="week-detail">
          <h3>📆 {selectedWeek}</h3>
          <div className="chart-summary">
            <div className="week-chart">
              <Bar data={renderChart(weekMap[selectedWeek])} options={{ responsive: true, scales: { y: { beginAtZero: true } } }} />
            </div>

            <div className="history-buttons">
              {Object.keys(weekMap).sort().reverse().map(week => (
                <button key={week} onClick={() => setSelectedWeek(week)} className={selectedWeek === week ? "selected-week" : ""}>
                  {week}
                </button>
              ))}
            </div>

            <div className="week-text">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                const entries = weekMap[selectedWeek].filter(e =>
                  e.timestamp.toDate().toLocaleDateString('en-US', { weekday: 'long' }) === day
                );
                return (
                  <div key={day}>
                    <strong>{day}:</strong> {entries.length > 0 ? entries.map((e, i) =>
                      <div key={i}>{e.score} / {e.total} <em>({e.unitId || 'No Unit'})</em></div>
                    ) : <em>No quizzes</em>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="sections">
        <div className="section-left">
          <h3>🏅 Badges Earned</h3>
          {earnedBadges.length > 0 ? (
            <ul className="badge-list">
              {earnedBadges.map((badge, index) => (
                <li key={index} className="badge" onClick={() => handleBadgeClick(badge)}>
                  <span>{badge}</span>
                  <p>{badgeDescriptions[badge]}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No badges earned yet. Keep learning!</p>
          )}
        </div>

        <div className="section-right">
          <h3>🏅 Badges Not Earned Yet</h3>
          {unearnedBadges.length > 0 ? (
            <ul className="badge-list">
              {unearnedBadges.map((badge, index) => (
                <li key={index} className="badge" onClick={() => handleBadgeClick(badge)}>
                  <span>{badge}</span>
                  <p>{badgeDescriptions[badge]}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>You’re close to earning all the badges!</p>
          )}
        </div>
      </div>




      {showPopup && (
        <div className="popup">
          <div className="popup-inner">
            <span className="close-btn" onClick={() => setShowPopup(false)}>×</span>
            <h3>{popupMessage}</h3>
            <div className="popup-gif">{popupGif}</div>
          </div>
        </div>
      )}

      {showLevelPopup && (
        <div className="popup">
          <div className="popup-inner">
            <span className="close-btn" onClick={() => setShowLevelPopup(false)}>×</span>
            <p>{levelDescription}</p>
          </div>
        </div>
      )}
    </div>
        </div>

  );
}

export default AchievementsPage;
